"""https://github.com/yosemitebandit/crabnet/blob/master/appengine/jsonify.py"""
import json
import re

from google.appengine.ext import db
from google.appengine.ext import ndb
from datetime import datetime
from datetime import timedelta

SIMPLE_TYPES = (int, long, float, bool, basestring)


def dumps(obj, camel_cased=False):
    """Convert models and other types into basic types.

    This converts to a python format similar to JSON, using the types int,
    long, float, bool, basestring, Nonetype, list, and dict. As Desmond calls
    it, PYDN, or Python dict notation.

    *Warning* this does not return a string.
    """
    if isinstance(obj, SIMPLE_TYPES):
        return obj
    elif obj == None:
        return None
    elif isinstance(obj, list):
        return [dumps(item, camel_cased) for item in obj]
    elif isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%dT%H:%M:%SZ")
    elif isinstance(obj, timedelta):
        # Format: 10 days, 23:59:59
        return str(obj)
    elif isinstance(obj, dict):
        properties = {}
        for key in obj:
            value = dumps(obj[key], camel_cased)
            if camel_cased:
                properties[camel_casify(key)] = value
            else:
                properties[key] = value
        return properties
    elif isinstance(obj, ndb.Key):
        return obj.urlsafe()

    properties = dict()
    if isinstance(obj, db.Model):
        properties['kind'] = obj.kind()
    if isinstance(obj, ndb.Model) and obj.key:
        properties['kind'] = obj.key.kind()

    serialize_blacklist = []
    if hasattr(obj, "_serialize_blacklist"):
        serialize_blacklist = obj._serialize_blacklist

    serialize_list = dir(obj)
    if hasattr(obj, "_serialize_whitelist"):
        serialize_list = obj._serialize_whitelist

    for property in serialize_list:
        if _is_visible_property(property, serialize_blacklist):
            try:
                value = obj.__getattribute__(property)
                if not _is_visible_property_value(value):
                    continue

                valueClass = str(value.__class__)
                if is_visible_class_name(valueClass):
                    value = dumps(value, camel_cased)
                    if camel_cased:
                        properties[camel_casify(property)] = value
                    else:
                        properties[property] = value
            except RuntimeError, rte:
                # Break on stack overflow
                if 'maximum recursion depth exceeded' in rte.message:
                    # You may be serializing an object that references itself
                    # like datetime.timedelta has .min and .max
                    raise
            except Exception:
                # Ignore other exceptions
                continue

    if len(properties) == 0:
        return str(obj)
    else:
        return properties

UNDERSCORE_RE = re.compile("_([a-z])")


def camel_case_replacer(match):
    """ converts "_[a-z]" to remove the underscore and uppercase the letter """
    return match.group(0)[1:].upper()


def camel_casify(str):
    return re.sub(UNDERSCORE_RE, camel_case_replacer, str)


CAMELCASE_RE = re.compile("([A-Z])")


def under_score_replacer(match):
    """ converts "[A-Z]" to lowercase the letter and insert an underscore """
    return "_" + match.group(0).lower()


def under_scorify(str):
    return re.sub(CAMELCASE_RE, under_score_replacer, str)


def under_scorify_dict(in_dict):
    if isinstance(in_dict, dict):
        out_dict = dict()
        for key in in_dict:
            value = under_scorify_dict(in_dict[key])
            out_dict[under_scorify(key)] = value
        return out_dict

    return in_dict


def _is_visible_property(property, serialize_blacklist):
    return (property[0] != '_' and
            not property.startswith("INDEX_") and
            not property in serialize_blacklist)


def _is_visible_property_value(value):
    # Right now only db.Blob objects are
    # blacklisted (since they may contain binary that doesn't JSONify well)
    if isinstance(value, db.Blob):
        return False
    return True


def is_visible_class_name(class_name):
    return not(
                ('function' in class_name) or
                ('built' in class_name) or
                ('method' in class_name) or
                ('db.Query' in class_name)
            )


class JSONModelEncoder(json.JSONEncoder):
    def encode(self, obj):
        obj = dumps(obj)
        encoded = super(self.__class__, self).encode(obj)
        # If </script> is ever inserted into an HTML document in the middle of
        # embedded JavaScript, the script will be terminated. This opens up the
        # possibility of XSS attacks if user provided input is output in the
        # JSON and it contains something like
        #
        #   </script ><script>alert(document.title);</script >
        #
        # See http://phabricator.khanacademy.org/T68
        return encoded.replace("</", "<\\/")


class JSONModelEncoderCamelCased(json.JSONEncoder):
    def encode(self, obj):
        # We override encode() instead of the usual default(), since we need
        # to handle built in types like lists and dicts ourselves as well.
        # Specifically, we need to re-construct the object with camelCasing
        # anyways, so do that before encoding.
        obj = dumps(obj, camel_cased=True)
        encoded = super(self.__class__, self).encode(obj)
        # See comment on JSONModelEncoder.encode for why this replacement is
        # done
        return encoded.replace("</", "<\\/")


def jsonify(data, camel_cased=False, pretty_print=False, **kwargs):
    """jsonify data in a standard (human friendly) way. If a db.Model
    entity is passed in it will be encoded as a dict.

    If the current request being served is being served via Flask, and
    has a parameter "casing" with the value "camel", properties in the
    resulting output will be converted to use camelCase instead of the
    regular Pythonic underscore convention.

    Returns a string.
    """

    if camel_cased:
        encoder = JSONModelEncoderCamelCased
    else:
        encoder = JSONModelEncoder

    if pretty_print:
        indent = 4
    else:
        indent = None

    return json.dumps(data,
                      skipkeys=True,
                      sort_keys=False,
                      ensure_ascii=False,
                      indent=indent,
                      cls=encoder,
                      **kwargs)
