export function LinkCopiedToastNotificationComponent() {
  return (
    <div className="toast" id="toast" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" />
        <path d="M7 12.5l3.2 3.2L17 9" />
      </svg>
      <div>
        <strong>Link copied</strong>
        <span>put.gd/1760918223.png</span>
      </div>
    </div>
  );
}
