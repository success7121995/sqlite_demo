import { AccordionForm, Table } from '@/src/components';

const DropdownFormComponent = () => {
  return (<>
  <div className="w-full flex flex-col justify-center items-center max-w-[800px]">
      <AccordionForm fields={fields} />
      <Table />
  </div>
  </>);
};

export default DropdownFormComponent;

// An array of objects that is used for building the INSERT form dynamically.
const fields = [
  {
    // Object containing a single key `stores` with more details defined.
    stores: {
      name: 'Name' // Field name for stores
    }
  },
  {
    // Object for `products` with multiple properties defined.
    products: {
      name: 'Name',             // Field name for products
      category: 'Category',     // Product category
      color: 'Color',           // Color of the product
      size: 'Size',             // Size of the product
      intended_use: 'Intended Use', // Intended use of the product
      description: 'Description',   // Description of the product
      is_saleable: 'On Sale',       // Flag if the product is saleable
      mid: 'Material'        // Material ID
    }
  },
  {
    // Object for `materials` with several attributes defined.
    materials: {
      name: 'Name',     // Name of the material
      sid: 'Supplier',  // Supplier ID
      price: 'Price',   // Price of the material
      qty: 'Quantity'   // Quantity of the material
    }
  },
  {
    // Object for `suppliers` containing contact details fields.
    suppliers: {
      name: 'Name',     // Name of the supplier
      phone: 'Phone',   // Phone number of the supplier
      address: 'Address' // Address of the supplier
    }
  },
  {
    // Object for `customers` with comprehensive details.
    customers: {
      title: 'Title',     // Title of the customer
      name: 'Name',       // Name of the customer
      email: 'Email',     // Email address of the customer
      phone: 'Phone',     // Phone number of the customer
      address: 'Address', // Physical address of the customer
      payment: 'Payment', // Payment method
      account: 'Account'  // Account number or details
    }
  },
];