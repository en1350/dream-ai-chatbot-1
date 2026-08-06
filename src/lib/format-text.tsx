export const formatText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
