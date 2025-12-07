interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const allCategories = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category === 'All' ? '' : category)}
          className={`category-tab ${
            (category === 'All' && !activeCategory) || category === activeCategory
              ? 'active'
              : ''
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
