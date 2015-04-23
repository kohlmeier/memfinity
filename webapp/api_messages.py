#!/usr/bin/python

# Copyright (C) 2010-2013 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


"""ProtoRPC message class definitions for Memfinity API."""

from protorpc import messages
from protorpc import message_types

class CardMessage(messages.Message):
    """ProtoRPC message definition to represent a card."""
    state = messages.StringField(1, required=True)


class CardViewRequest(messages.Message):
    """ProtoRPC message definition to represent a cards query."""
    key = messages.IntegerField(1, variant=messages.Variant.INT32, required=True)


class CardsViewRequest(messages.Message):
    """ProtoRPC message definition to represent a cards query."""
    limit = messages.IntegerField(1, default=10)

    class Order(messages.Enum):
        WHEN = 1
        TEXT = 2

    order = messages.EnumField(Order, 2, default=Order.WHEN)


class CardRequestMessage(messages.Message):
    """ProtoRPC message definition to represent a card to be inserted."""
    kata = messages.StringField(1, required=True)

class CardResponseMessage(messages.Message):

    """ProtoRPC message definition to represent a card that is stored."""
    id = messages.IntegerField(1)
    kata = messages.StringField(2)
    front = messages.StringField(3)
    back = messages.StringField(4)
    reversible = messages.BooleanField(5)
    input_format = messages.StringField(6)
    private = messages.BooleanField(7)
    user_nickname = messages.StringField(8)
    user_email = messages.StringField(9)
    source_url = messages.StringField(10)
    info = messages.StringField(11)
    last_review = message_types.DateTimeField(12)
    next_review = message_types.DateTimeField(13)
    added = message_types.DateTimeField(14)
    modified = message_types.DateTimeField(15)
    tags = messages.StringField(16, repeated=True)
    kind = messages.StringField(17)
    algo_data = messages.StringField(18)
    review_history = messages.StringField(19)
    user_key = messages.StringField(20)
    key = messages.StringField(21)

class CardViewResponse(messages.Message):
    """ProtoRPC message definition to represent a list of stored cards."""
    items = messages.MessageField(CardResponseMessage, 1, repeated=True)

