import './admin.css';

export const metadata = {
  title: 'Admin Panel | OSIS SMK Negeri Rembang',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      {children}
    </div>
  );
}
