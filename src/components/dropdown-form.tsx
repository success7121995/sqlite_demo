"use client"

import { ReactNode, useState, useRef, useEffect } from 'react';

// SVG
import EditIcon from '@/public/svg/edit.svg';

interface DropdownProps {
  children?: ReactNode,
  className?: string
}

const DropdownForm = ({
  children,
  className
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`${className} relative inline-block`}>

      <button 
        ref={buttonRef}
        onClick={toggleDropdown} 
        className="font-Regular text-blue-500 focus:outline-none"
      >
        <EditIcon height={15} width={15} className="stroke-blue-700"/>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute -left-[25px] -top-[70px] ml-2 bg-white pb-[40px] rounded-xl shadow-lg z-50 min-w-[150px]"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownForm;