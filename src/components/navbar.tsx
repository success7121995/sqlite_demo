"use client"

import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { useParams } from 'next/navigation';

const NavbarComponent = () => {
  const { table } = useParams();

  return (<>
    <Navbar>
      <NavbarBrand>
        <Link color="foreground" className="font-Medium" href="/">4037 FURNITURE</Link>
      </NavbarBrand>
    </Navbar>

    {/* Sub Navbar */}
    <Navbar>

      <NavbarContent></NavbarContent>

      <NavbarContent className="gap-4" justify="center">
        { navbarItems.map((item, i) => {

          return table == item.title.toLowerCase() ? (
            <NavbarItem key={i} isActive> 
              <Link color="primary" href={item.href}>{item.title}</Link>
            </NavbarItem>
          ) : (
            <NavbarItem key={i}> 
              <Link color="foreground" href={item.href}>{item.title}</Link>
            </NavbarItem>
          )
        })}
      </NavbarContent>

      <NavbarContent></NavbarContent>
    </Navbar>
  </>)
};

export default NavbarComponent;

const navbarItems = [
  {
    title: 'Stores',
    href: '/stores'
  },
  {
    title: 'Products',
    href: '/products'
  },
  {
    title: 'Suppliers',
    href: '/suppliers'
  },
  {
    title: 'Customers',
    href: '/customers'
  },
  {
    title: 'Materials',
    href: '/materials'
  },
];
