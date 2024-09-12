import {ElementRef, forwardRef, ReactNode,} from "react";

export {cnBase} from "tailwind-variants";
type BaseButtonElement = ElementRef<"button">;

interface IProps {
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
}


export const Button = forwardRef<BaseButtonElement, IProps>((props, ref) => {
    return (
        <button className='bg-blue-700 text-white rounded-md px-2 py-1' ref={ref} {...props}/>
    )
})

Button.displayName = "Button"