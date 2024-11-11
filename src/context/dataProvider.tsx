"use client"

import { ReactNode, useState, useContext, createContext } from 'react';

type Attribute = { [key: string]: string | number };
type TableState = { [key: string]: any };

interface DataContextProps {
  isFetching: boolean,
  handleFetching: () => void,
  fetchRowsData: (table: string) => Promise<TableState[]>,
  fetchRowsDataWithParams: <T extends Attribute>(table: string[], params?: T) => Promise<TableState[]>,
  addData: <T extends Attribute>(table: string, data: T) => {} | string,
  addReferenceData: <T extends Attribute>(table: string,id: string, referenceId: string, data?: T) => void,
  deleteData: (table: string, id: string) => void,
  updateData: <T extends Attribute>(table: string, id: string, data: T) => void
  formatBoolean: (value: 1 | 0) => string,
  formatCapitalize: (value: string) => string,
};

const DataContext = createContext<DataContextProps | undefined>(undefined);
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be called within the DataProvider.');
  return ctx;
};

const DataProvider = ({
  children
}: Readonly<{
  children: ReactNode
}>) => {
  // State to track data fetching status.
  const [isFetching, setIsFetching] = useState<boolean>(false);

  /**
   * Fetche data from the specified table via an API call
   * @param table 
   * @returns 
   */
  const fetchRowsData = async (table: string): Promise<TableState[]> => {
    try {
      const res = await fetch(`/api/${table}`);

      if (!res.ok) {
        const response = await res.json();
        throw new Error(response.error);
      }

      const data: TableState[] = await res.json();
      return data;

    } catch (err) {
      console.log(err);
      return [];
    }
  };

  /**
   * Fetches data from the specified table via an API call
   * @param table 
   * @returns 
   */
    const fetchRowsDataWithParams = async <T extends Attribute>(tables: string[], params?: T): Promise<TableState[]> => {
      let keys: string[] = [];
      let values: any[] = [];

      if (params) {
        keys = Object.keys(params);
        values = keys.map(key => encodeURIComponent(String(params[key])));
      }

      // Add comments....
      const query = 
        `/api/${tables[0]}?${tables.map((table, i) => `table${i}=${encodeURIComponent(table)}`).join('&')}` +
        `${keys.length > 0 ? '&' : ''}` +
        `${keys.map((key, i) => `${encodeURIComponent(key)}=${values[i]}`).join('&')}`;

      try {
        const res = await fetch(query);
        
        if (!res.ok) {
          const response = await res.json();
          throw new Error(response.error);
        }

        const data: TableState[] = await res.json();
        console.log(data);
        return data;
      } catch (err) {
        console.log(err);
        return [];
      }
    };
  
  /**
   * 
   * @param table 
   * @param data 
   */
  const addData = async <T extends Attribute>(table: string, data: T) => {
    // Generate an unique ID with timestamp and two sets of random hexadecimal
    const id = table.charAt(0) + '_' + (Date.now().toString(16) + 
    Math.floor(Math.random() * 16).toString(16) + 
    Math.floor(Math.random() * 16).toString(16));

    try {
      const res = await fetch('/api/add-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          attribute: { id, ...data }
        })
      });

      const response = await res.json();

      if (!res.ok) throw new Error(response.error);
      
      // Toggle re-refetch data to update the table
      handleFetching();

      return id;
    } catch (err) {
      return (err);
    }
  };

  /**
   * 
   * @param table 
   * @param id 
   * @param referenceId 
   * @param data 
   */
  const addReferenceData = async <T extends Attribute>(table: string, id: string, referenceId: string, data?: T) => {

    try {
      const res = await fetch('/api/add-reference-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          attribute: !data ? { id, referenceId } : { id, referenceId, ...data }
        })
      })

      const response = await res.json();

      if (!res.ok) throw new Error(response.error);
    } catch (err) {
      console.log(err);
    }
  }; 

  /**
   * Delete row data
   * @param table 
   * @param id 
   */
  const deleteData = async (table: string, id: string) => {
    try {
      const res = await fetch(`/api/delete-data`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id })
      });

      const response = await res.json();

      if (!res.ok) throw new Error(response.error);

    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Update data
   * @param table 
   * @param id 
   * @param data 
   */
  const updateData = async <T extends Attribute>(table: string, id: string, data: T) => {
    try {
      const res = await fetch('/api/update-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table,
          attribute: { id, data }
        })
      });

      const response = await res.json();

      if (!res.ok) throw new Error(response.error);

      // Toggle re-refetch data to update the table
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Toggle to re-fetch data.
   */
  const handleFetching = () => setIsFetching(prev => !prev); 

  // Helper function to format the 'is_saleable' field
  const formatBoolean = (value: 1 | 0): string => value === 1 ? 'Yes' : 'No';

  // Helper function to capitalize and format the 'category' field
  const formatCapitalize = (value: string) => value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (<>
    <DataContext.Provider value={{
      isFetching,
      handleFetching,
      fetchRowsData,
      fetchRowsDataWithParams,
      addData,
      addReferenceData,
      deleteData,
      updateData,
      formatBoolean,
      formatCapitalize,
    }}>
      {children}
    </DataContext.Provider>
  </>)
};

export default DataProvider;