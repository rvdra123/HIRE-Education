import { ArrowUpRight, Play } from "lucide-react";
import { youtubeChannels } from "@/lib/youtube-channels";

export default function YouTubeChannels() {
  return (
    <section
      className="youtube-section"
      id="featured-youtube-channels"
      aria-labelledby="youtube-title"
    >
      <div className="youtube-heading">
        <div>
          <h3 id="youtube-title">Career channels to try</h3>
          <p>
            Start with communication or interview advice, then browse more
            learning channels below.
          </p>
        </div>
        <span className="youtube-label">
          <Play size={14} aria-hidden="true" /> Worth a watch
        </span>
      </div>
      <div className="youtube-grid" data-stagger>
        {youtubeChannels.map((channel) => (
          <a
            className="youtube-card"
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            key={channel.name}
          >
            <div className="youtube-card-top">
              <span
                className={`channel-avatar channel-${channel.color}`}
                aria-hidden="true"
              >
                {channel.initials}
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </div>
            <span className="channel-topic">{channel.topic}</span>
            <h4>{channel.name}</h4>
            <p>{channel.description}</p>
            <span className="channel-link">
              <Play size={13} aria-hidden="true" /> Visit channel{" "}
              <span className="sr-only">on YouTube (opens in a new tab)</span>
            </span>
          </a>
        ))}
      </div>
      <p className="small-note">
        These independent creators cover a range of ages and careers. Use the
        advice that fits your experience.
      </p>
    </section>
  );
}
