"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { animated, useSpring } from '@react-spring/web'
import { useForm, type FieldValues } from "react-hook-form";
import { Button } from "@nextui-org/react";
import { Input } from '.';
import { useData } from '../context/dataProvider';

// SVG
import PlugIcon from '@/public/svg/plus-circle.svg';
import MinusIcon from '@/public/svg/minus-circle.svg';

interface AccordionFormProps {
  fields?: any[], // Optional fields array to configure form inputs
}

const AccordionForm = ({
  fields
}: AccordionFormProps) => {
  // State to manage the expansion of the form
  const [isExpand, setIsExpand] = useState<boolean>(false);
  // State to hold dynamic input fields based on props
  const [inputFields, setInputFields] = useState<any[]>();
  // State to manage animated form height
  const [formHeight, setFormHeight] = useState<number>(0);

  const { table } = useParams();
  const {
    addData,
    addReferenceData
  } = useData();

  const { register, handleSubmit, control, formState, reset } = useForm();

  // Animation properties for expanding and collapsing the form
  const props = useSpring({
    height: isExpand ? `${formHeight}px` : '0px', // Conditional height based on expansion based on the numbers of field
    config: { 
      friction: 40,
      tension: 250
    }
  });

  // Effect to setup input fields based on 'fields' prop and 'table' URL parameter
  useEffect(() => {
    if (!fields) return;

    const inputFieldsObj = fields.find(field => Object.keys(field)[0] === table);
    if (!inputFieldsObj) return;
  
    const inputFields = Object.values(inputFieldsObj)[0] as any[];
    const inputFieldsEntries = Object.entries(inputFields);
    setInputFields(inputFieldsEntries);

    // Calculate form height based on the number of input fields
    const newFormHeight = Math.ceil(inputFieldsEntries.length / 2) * 120;
    setFormHeight(newFormHeight);
  }, [fields, table]);

  /**
   * Submit form
   */
  const onSubmit = handleSubmit(async (data) => {
    if (typeof table !== 'string') return;
    
    try {
      const { mid, ...filteredData } = data;
      const id = await addData(table, filteredData);
      
      if (['products'].includes(table) && typeof id == 'string') {
        const mids: string[] = mid.split(',');
        
        if (mids.length > 0) {
          mids.map(async mid => {
            console.log(mid);
            await addReferenceData('furniture_materials', id, mid);
          })
        }
      }

      reset();
    } catch (err) {
      console.log(err);
    }
  });

  return (<>
      { inputFields && inputFields.length > 0 && <>

        {/* Toggler */}
        <div className="flex justify-end w-full">
          <button onClick={() => setIsExpand(prev => !prev)}>
            { isExpand ? <MinusIcon height={25} width={25} className="fill-primary" /> : <PlugIcon height={25} width={25} className="fill-primary"/>}
          </button>
        </div>

        {/* Dropdown Form */}
        <animated.form 
          className="w-full rounded-md relative overflow-hidden mt-4 max-h-[380px]"
          style={{ ...props }}
          onSubmit={onSubmit}
      >
          <div className={`${inputFields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} grid`}>
            {inputFields.map(([key, field], i) => (
              <div key={String(i)}>
                <Input
                  keyName={key}
                  field={field}
                  register={register}
                  control={control}
                  errors={formState.errors}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="bg-primary text-white absolute bottom-0 right-0 m-2" size="sm">Add</Button>
        </animated.form>
      </>
      }
  </>);
};

export default AccordionForm;