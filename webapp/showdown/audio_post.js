//
//  Audio
//  A showdown output (post-processor) extension to convert inline links to .mp3 files into HTML5 audio tags for streaming
//  There does not appear to be a convention for audio markdown
//  For the sake of this implementation, we modify the image pattern.
/*
It's a three stage process: 
The first stage is handled by audio_pre. It simply inserts a ! between the two characters 🔊 and [. The ! will be picked up by the next stage.
The second parse is handled by core showdown.js image handler (_DoImages). It converts audio markdown to an img tag, starting at the exclamation mark, leaving the leading Unicode speaker mark in place.
The third stage audio_post extension then converts that img tag to an HTML5 audio tag and strips the leading 🔊 character.

🔊[Alt text](url)                    --> 🔊![Alt text](url)                    --> 🔊<img src="/path/to/audio.mp3" alt="Alt text" title="" />                     --> <audio src="/path/to/img.jpg" alt="Alt text" title="" /> 
🔊[Alt text](url "optional title")   --> 🔊![Alt text](url "optional title")   --> 🔊<img src="/path/to/audio.mp3" alt="Alt text" title="Optional title" />       --> <audio src="/path/to/audio.mp3" alt="Alt text" title="Optional title" />
🔊[Alt text][id]                     --> 🔊![Alt text][id]                     --> 🔊<img src="url/to/audio" alt="Alt text" title="Optional title attribute" />   --> <audio src="url/to/audio" alt="Alt text" title="Optional title attribute" />
*/

(function(){

    var audio_post = function(converter) {
        return [
            { type: 'output', filter: function(source){
                return source.replace(/🔊<img/gi, 
                        function(wholematch) {
                    var retStr = '<audio preload="auto" controls autoplay';
                    return retStr;
                });
            }} 
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.prettify = audio_post; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = audio_post;

}());
