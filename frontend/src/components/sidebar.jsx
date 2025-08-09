// components/Sidebar.jsx
import { FileText, Star, Trash2 } from 'lucide-react';

export default function Sidebar({ currentCategory, setCurrentCategory }) {
  const categories = [
    { name: 'All Notes', icon: FileText },
    { name: 'Favorites', icon: Star },
    { name: 'Trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 bg-white border-r p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <ul className="space-y-2">
        {categories.map(({ name, icon: Icon }) => (
          <li
            key={name}
            className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-gray-100 ${
              currentCategory === name ? 'bg-gray-200 font-semibold' : ''
            }`}
            onClick={() => setCurrentCategory(name)}
          >
            <Icon className="h-5 w-5" />
            {name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
