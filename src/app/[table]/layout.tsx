import { ReactNode } from 'react';
import { DataProvider } from '@/src/context'
import { Navbar } from '@/src/components';


const TableLayout = ({
  children,
}: {
  children: ReactNode,
}) => {

  return (<>
    <DataProvider>
      <Navbar />
      <div className="flex justify-center items-center flex-col mt-10 w-4/6 mx-auto gap-y-4">
        {children}
      </div>
    </DataProvider>
  </>);
};

export default TableLayout;