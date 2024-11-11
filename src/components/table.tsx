"use client"

import { useState, useEffect, useRef, KeyboardEvent, Attributes } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button
} from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { Spinner } from "@nextui-org/react";
import { useData } from '../context/dataProvider';
import { Input, DropdownForm } from '@/src/components';

// SVG
import TrashIcon from '@/public/svg/trash.svg';

type TableState = { [key: string]: any };

const TableComponent = () => {
  // Get 'table' parameter from URL
  const { table } = useParams();
  // State for table columns
  const [columns, setColumns] = useState<TableState[]>([]);
  // State for table rows
  const [rows, setRows] = useState<TableState[]>([]);
  // State to handle loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // FirstInputRef
  const firstInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, formState } = useForm();
  
  const {
    isFetching,
    fetchRowsData,
    fetchRowsDataWithParams,
    deleteData,
    updateData,
    formatBoolean,
    formatCapitalize
  } = useData();

  useEffect(() => {
    if (!isLoading && rows.length > 0) {
      firstInputRef.current?.focus();
    }
  }, [isLoading, rows]);

  // Effect hook to fetch data whenever 'isFetching' or 'table' changes
  useEffect(() => {
    // Begin loading
    setIsLoading(true);

    // Fetch rows data and format to table
    const handleFetchRowsData = async () => {
      if (typeof table !== 'string') return;
      let data: TableState[] = [];

      if (table === 'materials') {
        data = await fetchRowsDataWithParams([table, 'suppliers']);
      } else {
        data = await fetchRowsData(table);
      }
      
      // Handle empty data scenario
      if (data.length === 0) {
        setColumns([]);
        setRows([]);
        setIsLoading(false);
        return;
      }

      // Create columns dynamically from data keys
      const dynamicColumns = Object.keys(data[0]).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }));

      // Add a special 'Actions' column for operations like delete and edit
      const actionColumn = {
        key: 'actions',
        label: '',
      };

      setColumns([...dynamicColumns, actionColumn]);

      // Add action buttons to each row data for operations
      const enhancedRows = data.map(row => ({
        ...row,
        actions: (
          <div className="flex space-x-2 -translate-y-[2px]">
            <button onClick={() => handleDelete(row)}>
              <TrashIcon height={20} width={20} className="stroke-red-500"/>
            </button>
          </div>
        ),
      }));

      setRows(enhancedRows);
      setIsLoading(false);
    }; 

    handleFetchRowsData();
  }, [isFetching, table]);

  /**
   * Handle delete operation
   * @param row 
   * @returns 
   */
  const handleDelete = async (row: TableState) => {
    if (typeof table !== 'string') return;

    // Prompt out a confirm window
    const confirmDelete = window.confirm(`Are you sure you want to delete "${row.name || 'this item'}"?`);
    if (!confirmDelete) return; // Cancel the action

    try {
      await deleteData(table, row.id);

      // Update UI by filtering out the deleted row
      setRows(prevRows => prevRows.filter(r => r.id !== row.id));
      alert('Row deleted successfully.');
    } catch (err: any) {
      alert(`Error deleting row: ${err.message}`);
    }
  };

  /**
   * Handle data update
   * @param table 
   * @param data 
   */
  const handleUpdate = handleSubmit(async (data) => {
    if (typeof table !== 'string') return;

    const id = Object.keys(data)[0].split('_').slice(0, 2).join('_');

    try {
      await updateData(table, id, data);

      
    } catch (err) {
      console.log(err);
    }
  });

  // Return Spinner component during loading
  if (isLoading) return <Spinner />

  // Display message when no data is available
  if (rows.length === 0) return <h3 className="text-center mt-4 font-Medium text-gray-500">No data available</h3>

  return (
    <div className="overflow-x-auto relative">
      <Table aria-label="Dynamic Table with Actions" className="min-w-[800px] mb-[75px]">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key}>
              {column.key === 'is_saleable' ? 'On Sale' : formatCapitalize(column.label)}
            </TableColumn>
          ))}
        </TableHeader>

        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${i}_${row.id}`} className="hover:bg-slate-50">
              {columns.map((column) => {
                const { key } = column;
                let cellValue = row[key];

                if (['is_saleable'].includes(key)) {
                  cellValue = formatBoolean(cellValue);
                }

                if (['category', 'payment', 'title', 'name', 'intended_use'].includes(key)) {
                  cellValue = formatCapitalize(cellValue);
                }

                return (
                  <TableCell 
                    className="min-w-[120px] text-black font-Regular text-xs relative overflow-visible"
                    key={key}
                  >
                    <div className="flex justify-between items-center">
                      {cellValue}

                      {/* DropdownForm */}
                      {!['actions', 'id'].includes(key) && (
                        <DropdownForm>
                          <form onSubmit={handleUpdate}>
                            <Input
                              keyName={`${row.id}_${key}`}
                              field={key}
                              register={register}
                              control={control}
                              errors={formState.errors}
                              defaultValue={cellValue}
                              enableLabel={false}
                              enableWrapper={false}
                            />
                              <Button type="submit" className="bg-primary text-white absolute bottom-0 right-0 m-2" size="sm">Enter</Button>
                          </form>
                        </DropdownForm>
                      )}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableComponent;