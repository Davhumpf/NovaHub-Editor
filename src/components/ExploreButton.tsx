'use client';

interface ExploreButtonProps {
  onClick: () => void;
}

export default function ExploreButton({ onClick }: ExploreButtonProps) {
  return (
    <button
      onClick={onClick}
      className="explore-button"
      style={{
        padding: '12px 32px',
        fontSize: '16px',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      🚀 Explorar Repositorios
    </button>
  );
}
