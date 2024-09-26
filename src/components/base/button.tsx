import {ElementRef, forwardRef, ReactNode,} from "react";
import {tv, VariantProps} from 'tailwind-variants';

export {cnBase} from "tailwind-variants";
type BaseButtonElement = ElementRef<"button">;


const button = tv({
    base: 'bg-blue-700 text-white rounded-md px-2 py-1',
    variants: {
        color: {
            primary: 'bg-blue-500 text-white',
            neutral: 'bg-zinc-500 text-black dark:text-white'
        }
    },
    defaultVariants: {
        color: 'primary',
    }
})

type ButtonVariants = VariantProps<typeof button>


interface IProps extends ButtonVariants{
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
}

export const Button = forwardRef<BaseButtonElement, IProps>((props, ref) => {
    return (
        <button className={button(props)} ref={ref} {...props}/>
    )
})

Button.displayName = "Button"