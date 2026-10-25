import CurrentObjective from "./CurrentObjective.jsx";

export default function ObjectivesMenu({
  isOpen,
  objective,
  progress,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="objectives-overlay">
      <CurrentObjective
        expanded
        objective={objective}
        onClose={onClose}
        progress={progress}
      />
    </div>
  );
}
