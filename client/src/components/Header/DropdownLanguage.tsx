import { useState } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import { useTranslation } from 'react-i18next';

const DropdownLanguage = () => {
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    window.location.reload();
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link onClick={() => setDropdownOpen(!dropdownOpen)} className="" to="#">
        {i18n.language.includes('vi') ? 'Vie' : 'Eng'}
      </Link>

      {/* <!-- Dropdown Start --> */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex-col rounded-xl bg-[#F2F4F7] `}
        >
          <ul className="flex flex-col gap-2 border-stroke px-2 py-2">
            <li>
              <button
                onClick={() => onChangeLanguage('vi')}
                className={`flex items-center ${
                  i18n.language.includes('vi') ? 'bg-black text-dreamchain' : ''
                } text-sm px-6 py-1 rounded-xl font-medium duration-300 ease-in-out hover:text-dreamchain lg:text-base`}
              >
                Vie
              </button>
            </li>
            <li>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`flex items-center ${
                  i18n.language.includes('en') ? 'bg-black text-dreamchain' : ''
                } text-sm px-6 py-1 rounded-xl font-medium duration-300 ease-in-out hover:text-dreamchain lg:text-base`}
              >
                Eng
              </button>
            </li>
          </ul>
        </div>
      )}
      {/* <!-- Dropdown End --> */}
    </ClickOutside>
  );
};

export default DropdownLanguage;
