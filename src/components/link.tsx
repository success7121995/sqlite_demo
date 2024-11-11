"use client"

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from "@nextui-org/react";

interface LinkCopmponentProps {
  children: ReactNode,
  href: string,
  className?: string,
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined
}

const LinkButtonComponent = ({
  children,
  href,
  className,
  color
}: LinkCopmponentProps) => {

  return (<>
    <Button radius="full" color={color ?? 'primary'} className={className} size="lg">
      <Link href={href}>{children}</Link>
    </Button>
  </>);
};

export default LinkButtonComponent;