import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ value?: string; onValueChange?: (val: string) => void }>({});

interface TabsProps {
    value: string;
    onValueChange: (val: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("w-full", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (val: string) => void;
}

export function TabsList({ className, value, onValueChange, children, ...props }: TabsListProps) {
    return (
        <div
            className={cn(
                "inline-flex min-h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto max-w-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value?: string;
    currentValue?: string;
    onValueChange?: (val: string) => void;
}

export function TabsTrigger({ className, value: triggerValue, currentValue, onValueChange, ...props }: TabsTriggerProps & { value: string }) {
    const context = React.useContext(TabsContext);
    const resolvedValue = context.value !== undefined ? context.value : currentValue;
    const resolvedOnChange = context.onValueChange !== undefined ? context.onValueChange : onValueChange;
    const isActive = triggerValue === resolvedValue;

    return (
        <button
            type="button"
            onClick={() => resolvedOnChange?.(triggerValue)}
            className={cn(
                "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-muted-foreground/10",
                className
            )}
            {...props}
        />
    );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export function TabsContent({ className, value: contentValue, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext);
    const contextValue = context.value !== undefined ? context.value : (props as any).value;
    if (contentValue !== contextValue) return null;
    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        />
    );
}

