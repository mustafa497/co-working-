import Carousel from "../Carousel/Carousel";
import type { CarouselImage } from "../../types";
import "./Card.css";

interface CardProps {
  planName: string;
  title: string;
  description: string;
  tags: string[];
  learnMoreUrl: string;
  images: CarouselImage[];
  variant?: "plans-glow";
}

function Card({
  title,
  description,
  tags,
  learnMoreUrl,
  images,
  variant,
}: CardProps) {
  const className = variant ? `card card--${variant}` : "card";

  return (
    <article className={className}>
      <div className="card__media">
        <Carousel images={images} label={title} />
      </div>

      <div className="card__header">
        <h2 className="card__title">{title}</h2>
        <span className="card__rule" aria-hidden="true" />
        <a className="card__cta" href={learnMoreUrl}>
          Learn More
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 17 L17 7 M9 7 H17 V15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <p className="card__description">{description}</p>

      <div className="card__suited">
        <span className="card__suited-label">Best Suited For:</span>
        <ul className="card__tags">
          {tags.map((tag) => (
            <li key={tag} className="card__tag">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default Card;
