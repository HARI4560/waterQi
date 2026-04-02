export default function LoadingSpinner({ message = 'Loading water quality data...' }) {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <div className="loading-rings">
          <div className="loading-ring ring-outer"></div>
          <div className="loading-ring ring-inner"></div>
          <span className="loading-drop">💧</span>
        </div>
        <p className="loading-message">{message}</p>
        <div className="loading-bar-track">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
}
