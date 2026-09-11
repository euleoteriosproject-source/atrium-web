import { faqItems } from "@/content/home";

export function Faq() {
  return (
    <div className="divide-y divide-navy-950/12 border-y border-navy-950/12">
      {faqItems.map((item, index) => (
        <details key={item.question} className="group">
          <summary className="motion-interactive flex min-h-18 cursor-pointer list-none items-center gap-5 py-5 text-left text-body font-semibold transition-colors hover:text-navy-800 sm:min-h-20 sm:text-h4 [&::-webkit-details-marker]:hidden">
            <span className="text-caption font-bold text-gray-text">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1">{item.question}</span>
            <span
              aria-hidden="true"
              className="motion-interactive relative size-5 shrink-0 transition-transform group-open:rotate-45"
            >
              <span className="absolute top-1/2 left-0 h-px w-full bg-current" />
              <span className="absolute top-0 left-1/2 h-full w-px bg-current" />
            </span>
          </summary>
          <p className="max-w-3xl pr-8 pb-7 pl-9 text-body text-gray-text sm:pl-12">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
