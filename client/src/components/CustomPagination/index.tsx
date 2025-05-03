import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageRangeDisplayed?: number; // số lượng trang muốn hiển thị cùng lúc (ví dụ: 5)
}

const CustomPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageRangeDisplayed = 5,
}) => {
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];

    const half = Math.floor(pageRangeDisplayed / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (end - start + 1 < pageRangeDisplayed) {
      if (start === 1) {
        end = Math.min(totalPages, start + pageRangeDisplayed - 1);
      } else if (end === totalPages) {
        start = Math.max(1, totalPages - pageRangeDisplayed + 1);
      }
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <div className="text-gray-600">Total pages: {totalPages}</div>
      <div className="flex items-center gap-1">
        <button
          className="px-2 py-1 border rounded hover:bg-gray-100"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>

        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={index} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          className="px-2 py-1 border rounded hover:bg-gray-100"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
