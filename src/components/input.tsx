"use client";

import { useState, useEffect, KeyboardEvent } from 'react';
import { Select, SelectItem, Input } from "@nextui-org/react";
import {
  Controller,
  type FieldValues,
  type FieldErrors,
  type UseFormRegister,
  type Control
} from 'react-hook-form';

interface Option {
  id: string,
  name: string,
}

interface InputProps {
  keyName: string, // The 'name' attribute of the input field
  field: string, // Register input for validation and value gathering
  register: UseFormRegister<FieldValues>, // Register input for validation and value gathering
  control: Control<FieldValues>, // Object to control the input for react-hook-form
  errors?: FieldErrors<FieldValues> | undefined, // Optional object containing any errors for the fields
  defaultValue?: any, // Default value
  enableLabel?: boolean, // Enable label
  enableWrapper?: boolean, // Enable Wrapper background
}

const InputComponent = ({
  keyName,
  field,
  register,
  control, 
  errors,
  defaultValue,
  enableLabel = true,
  enableWrapper = true,
}: InputProps) => {
  // State for managing the type of input (either 'input' or 'select')
  const [inputType, setInputType] = useState<'input' | 'select' | 'checkbox'>('input');
  // Consolidated options array
  const [options, setOptions] = useState<Option[]>([]);
  // State to track if the input is required
  const [isRequired, setIsRequired] = useState<boolean>(false);
  // State to track if the input is invalid, change the background color
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  // Effect hook to setup input type and options based on the keyName
  useEffect(() => {
    // Determine if the input should be a select box and configure options if necessary
    if (['title', 'payment', 'sid', 'mid', 'category', 'intended_use', 'is_saleable'].includes(keyName)) {
      setInputType('select');
      if (keyName === 'title') {
        setOptions([
          { id: 'mr', name: 'Mr' },
          { id: 'ms', name: 'Ms' },
          { id: 'mrs', name: 'Mrs' },
        ]);
      } else if (keyName === 'payment') {
        setOptions([
          { id: 'credit_card', name: 'Credit Card' },
          { id: 'apple_pay', name: 'Apple Pay' },
          { id: 'samsung_pay', name: 'Samsung Pay' },
          { id: 'fps', name: 'FPS' },
        ]);
      } else if (['sid', 'mid'].includes(keyName)) {
        // Placeholder for foreign key fetch; handled in separate useEffect
        setOptions([{ id: '', name: '' }]); // Initial empty option
      } else if (keyName === 'category') {
        setOptions([
          { id: 'sofas', name: 'Sofas' },
          { id: 'chairs', name: 'Chairs' },
          { id: 'tables', name: 'Tables' },
          { id: 'beds', name: 'Beds' },
          { id: 'dressers', name: 'Dressers' },
          { id: 'cabinets', name: 'Cabinets' },
        ]);
      } else if (keyName === 'intended_use') {
        setOptions([
          { id: 'home', name: 'Home' },
          { id: 'office', name: 'Office' },
        ]);
      } else if (['is_saleable'].includes(keyName)) {
        setOptions([
          { id: '1', name: 'Yes' },
          { id: '0', name: 'No' }
        ])
      }
    }

    // Determine if the field is required
    if ([
      'name',
      'lname',
      'phone',
      'email',
      'title',
      'payment',
      'intended_use',
      'sid',
    ].includes(keyName)) {
      setIsRequired(true);
    } else {
      setIsRequired(false);
    }
  }, [keyName]);

  // Effect hook to fetch foreign key data if necessary
  useEffect(() => {
    if (!['sid', 'mid'].includes(keyName)) return; // Only fetch for foreign keys 'sid' and 'mid'
    const handleFetchData = async (field: string) => {
      try {
        const res = await fetch(`/api/${field}s`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if(!data || data.length < 1) return setOptions([{ id: '', name: '' }]); 
        
        // Map fetched data to Option interface
        const fetchedOptions: Option[] = data.map((item: { id: string | number, name: string }) => ({
          id: item.id,
          name: item.name,
        }));

        // Prepend an empty option for default selection
        setOptions(fetchedOptions);
      } catch (error) {

        console.error("Error fetching foreign keys:", error);
        setOptions([{ id: '', name: '' }]);
      }
    };
    
    handleFetchData(field);
  }, [keyName]);

  // Effect hook to track and update isInvalid state based on errors
  useEffect(() => {
    // Check if there are errors for the current keyName
    const hasError = errors && errors[keyName];
    
    // Update the isInvalid state based on the presence of errors
    setIsInvalid(!!hasError);
  }, [errors, keyName]);

  // Determine and display any validation error message
  const errorMessage =  errors?.[keyName]?.message as string | undefined;

  return (
    <div className={`relative rounded-md py-1 px-2 m-2`}>
      {/* Conditional rendering based on the inputType state */}

      {/* Input */}
      { inputType === 'input' &&
        <Controller
          name={keyName}
          control={control}
          rules={{
            required: isRequired ? `${field} is required` : false,
          }}
          defaultValue={defaultValue || ''}
          render={({ field }) => (
            <Input
              {...register(keyName)}
              size="sm"
              type="text"
              label={enableLabel ? field.name : ''}
              classNames={{
                label: ['text-sm font-Regular'],
                input: ['font-Regular text-black text-xs'],
                inputWrapper: [enableWrapper ?
                  'bg-gray-50' :
                  'bg-transparent shadow-none',
                  isInvalid ? "border-red-500" : ""],
              }}
              errorMessage={errorMessage}
              isInvalid={isInvalid}
            />
          )}
        />
      }
              
      {/* Select */}
      { inputType === 'select' &&
        <Controller 
          name={keyName}
          control={control}
          defaultValue={defaultValue || ''}
          rules={{
            required: isRequired ? `${field} is required` : false,
          }}
          render={({ field: controllerField }) => (
            <>
              <Select
                {...register(keyName)}
                size="sm"
                label={`Select ${field}`}
                className="font-Regular"
                style={{ backgroundColor: '#f9fafb' }}
                {...controllerField}
                value={controllerField.value || ''}
                onChange={e => {
                  ['is_saleable'].includes(keyName) ?
                    controllerField.onChange(Number(e.target.value)): // Boolean, have to be convert to 1 or 0 before submmiting
                    controllerField.onChange(e.target.value);
                }}
                isInvalid={isInvalid}
                selectionMode={keyName == 'mid' ? 'multiple' : 'single'}
              >
                {options.map(option => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    textValue={option.name || ' '}
                    className="font-Regular text-sm"
                  >
                    {option.name}
                  </SelectItem>
                ))}
              </Select>
              {/* Display error message if any */}
              {errorMessage && (
                <p className="mt-1 text-red-500 font-Regular text-xs">
                  {errorMessage}
                </p>
              )}
            </>
          )}
        />}
    </div>
  );
};

export default InputComponent;