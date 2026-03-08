"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "@/components/ui/Button";

interface NavButtonProps extends Omit<ButtonProps, "asChild"> {
    href: string;
}

export function NavButton({ href, children, onClick, ...props }: NavButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        if (e.defaultPrevented) return;

        startTransition(() => {
            router.push(href);
        });
    };

    return (
        <Button {...props} onClick={handleClick} isLoading={isPending}>
            {children}
        </Button>
    );
}
