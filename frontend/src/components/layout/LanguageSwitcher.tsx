'use client';

// 🌐 CADILLAC EV CIS - Language Switcher Component
// Swiss market multi-language support with elegant UI

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Languages, Check, Globe } from 'lucide-react';
import { useTranslation, SupportedLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'flag-only';
  showLabel?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  showLabel = true,
  className = ''
}) => {
  const { language, setLanguage, t, getLanguageOptions } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = getLanguageOptions();
  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setIsOpen(false);
    
    // Store preference in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('cadillac_ev_language', newLanguage);
    }
  };

  // Compact variant - just the flag
  if (variant === 'flag-only') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 ${className}`}
            title={currentLanguage?.name}
          >
            <span className="text-lg">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('common.language')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Compact variant - flag + code
  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 px-3 ${className}`}
          >
            <span className="text-sm">{currentLanguage?.flag}</span>
            <span className="text-xs font-medium uppercase">{language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Sprache wählen
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-gray-500 uppercase">{lang.code}</div>
                </div>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant - full display
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
        >
          <Languages className="h-4 w-4" />
          <span className="text-lg">{currentLanguage?.flag}</span>
          {showLabel && (
            <span className="hidden sm:inline">{currentLanguage?.name}</span>
          )}
          <Badge variant="secondary" className="text-xs uppercase">
            {language}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4" />
          🇨🇭 Schweizer Sprachen / Langues suisses
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
            className="flex items-center justify-between cursor-pointer py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs text-gray-500">
                  {lang.code === 'de' && 'Deutsch (Schweiz)'}
                  {lang.code === 'fr' && 'Français (Suisse)'}
                  {lang.code === 'it' && 'Italiano (Svizzera)'}
                  {lang.code === 'en' && 'English (International)'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {language === lang.code && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              <Badge 
                variant={language === lang.code ? "default" : "secondary"} 
                className="text-xs uppercase"
              >
                {lang.code}
              </Badge>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Swiss market language info */}
        <div className="px-3 py-2 text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Offizielle Schweizer Sprachen</span>
          </div>
          <div className="text-xs text-gray-400">
            Deutsch, Französisch, Italienisch, Rätoromanisch
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;