/*
 * Interface for the FAQ page
 */
import React from 'react';

export default function FAQ() {
  return (
    <div>
      <div id="faq-links">
        <div className="features container">
            <div className="feature">
                <h1>Memfinity: Frequently Asked Questions</h1>
            </div>
        </div>
    </div>
    <div className="faq-qna">
        <div className="features container">
            <div className="feature">
                <h3>Q: What kind of spaced repetition algorithm does Memfinity use?</h3>
                <p>A: Memfinity uses a <a href="http://en.wikipedia.org/wiki/Leitner_system">Leitner system</a> algorithm. The current configuration for the algorithm uses five boxes with corresponding review intervals of 1, 5, 25, 125, and 625 days. In the future, we'd like to add the ability for each user to customize this configuration.</p>
            </div>
            <div className="feature">
                <h3>Q: Why was Memfinity made? Doesn't high quality spaced repetition software alread exist?</h3>
                <p>A: Memfinity was made as a hackthon project with friends from Khan Academy. While <a href="http://ankisrs.net/">other spaced repetition software</a> exists, we were intrigued by making something that had social component. We also wanted something that was web-native and built on top of a web services API. Memfinity requires no downloads, and lives where you live and learn--in your browser.</p>
            </div>
            <div className="feature">
                <h3>Q: Can I embed images in my cards?</h3>
                <p>A: Yup, at least if the images are hosted somewhere else on the web.  Memfinity supports Markdown syntax for your cards, and you can find the syntax for specifying an image in Markdown <a href="http://daringfireball.net/projects/markdown/syntax#img">here</a>. If your images are not already hosted on the web, you can use a product like a public Dropbox folder to create linkable URLs for your images.</p>
            </div>
            <div className="feature">
                <h3>Q: Do I need to have a Google account to use Memfinity?</h3>
                <p>A: Right now, Memfinity requires a Google account to log in. You can search public cards without logging in, but in order to create and practice cards you will need to create a free Google account.</p>
            </div>
            <div className="feature">
                <h3>Q: How do I customize my avatar?</h3>
                <p>A: Memfinity uses <a href="https://en.gravatar.com/">Gravatar</a> for avatar support. To customize your avatar, create a Gravatar associated with the Gmail account you use for logging in to Memfinity.</p>
            </div>
            <div className="feature">
                <h3>Q: How can I contribute to Memfinity?</h3>
                <p>A: If you're a developer, you can <a href="https://github.com/kohlmeier/memfinity">find us on GitHub</a> and help make the project better. We consider it a pretty basic proof-of-concept right now, and we'd love to keep improving it.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
