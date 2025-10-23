import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

// Country data with flags and phone codes
const countries = [
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phoneCode: '+84' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82' },
  { code: 'CN', name: 'China', flag: '🇨🇳', phoneCode: '+86' },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phoneCode: '+66' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phoneCode: '+60' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phoneCode: '+62' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', phoneCode: '+63' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', phoneCode: '+886' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', phoneCode: '+852' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', phoneCode: '+853' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phoneCode: '+52' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phoneCode: '+54' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', phoneCode: '+7' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phoneCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phoneCode: '+41' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', phoneCode: '+43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phoneCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', phoneCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phoneCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', phoneCode: '+358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', phoneCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', phoneCode: '+420' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', phoneCode: '+36' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', phoneCode: '+40' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', phoneCode: '+359' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', phoneCode: '+30' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', phoneCode: '+351' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', phoneCode: '+353' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', phoneCode: '+64' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phoneCode: '+27' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', phoneCode: '+20' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phoneCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', phoneCode: '+254' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', phoneCode: '+212' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', phoneCode: '+216' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', phoneCode: '+213' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', phoneCode: '+218' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', phoneCode: '+249' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', phoneCode: '+251' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', phoneCode: '+233' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', phoneCode: '+225' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', phoneCode: '+221' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', phoneCode: '+223' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', phoneCode: '+226' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', phoneCode: '+227' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', phoneCode: '+235' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', phoneCode: '+237' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', phoneCode: '+236' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', phoneCode: '+242' },
  { code: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩', phoneCode: '+243' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', phoneCode: '+244' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', phoneCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', phoneCode: '+263' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', phoneCode: '+267' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', phoneCode: '+264' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', phoneCode: '+268' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', phoneCode: '+266' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', phoneCode: '+265' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', phoneCode: '+258' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', phoneCode: '+261' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', phoneCode: '+230' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', phoneCode: '+248' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', phoneCode: '+269' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', phoneCode: '+253' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', phoneCode: '+252' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', phoneCode: '+291' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', phoneCode: '+256' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', phoneCode: '+255' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', phoneCode: '+250' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', phoneCode: '+257' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', phoneCode: '+211' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', phoneCode: '+236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', phoneCode: '+235' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', phoneCode: '+227' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', phoneCode: '+226' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', phoneCode: '+223' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', phoneCode: '+221' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', phoneCode: '+220' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', phoneCode: '+245' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', phoneCode: '+224' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', phoneCode: '+232' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', phoneCode: '+231' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', phoneCode: '+228' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', phoneCode: '+229' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻', phoneCode: '+238' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', phoneCode: '+239' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', phoneCode: '+240' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', phoneCode: '+241' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', phoneCode: '+242' },
  { code: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩', phoneCode: '+243' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', phoneCode: '+244' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', phoneCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', phoneCode: '+263' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', phoneCode: '+267' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', phoneCode: '+264' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', phoneCode: '+268' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', phoneCode: '+266' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', phoneCode: '+265' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', phoneCode: '+258' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', phoneCode: '+261' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', phoneCode: '+230' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', phoneCode: '+248' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', phoneCode: '+269' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', phoneCode: '+253' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', phoneCode: '+252' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', phoneCode: '+291' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', phoneCode: '+256' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', phoneCode: '+255' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', phoneCode: '+250' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', phoneCode: '+257' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', phoneCode: '+211' },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultCountry?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  className,
  disabled = false,
  defaultCountry = 'VN',
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const country = countries.find(c => value.startsWith(c.phoneCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.phoneCode, ''));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Update parent when phone number changes
  useEffect(() => {
    if (onChange) {
      const fullNumber = phoneNumber ? `${selectedCountry.phoneCode}${phoneNumber}` : '';
      onChange(fullNumber);
    }
  }, [phoneNumber, selectedCountry, onChange]);

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Only allow digits
    setPhoneNumber(input);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phoneCode.includes(searchQuery)
  );

  return (
    <div className={cn('relative', className)}>
      <div className="flex rounded-md border border-input bg-background">
        {/* Country Selector */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 border-r border-input rounded-l-md rounded-r-none hover:bg-accent"
              disabled={disabled}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors',
                    selectedCountry.code === country.code && 'bg-accent'
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{country.name}</div>
                    <div className="text-xs text-muted-foreground">{country.phoneCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <Input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-0 rounded-l-none rounded-r-md focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
};

export default PhoneInput;
