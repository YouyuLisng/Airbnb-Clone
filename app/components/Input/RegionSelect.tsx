"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import useRegions from "@/app/hooks/useRegions";
import { cn } from "@/app/libs/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/app/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/app/components/ui/popover";

export type RegionSelectValue = {
    label: string,
    latlng: readonly number[],
    region: string,
    value: string
}

interface RegionSelectProps {
    value?: RegionSelectValue;
    onChang: (value: RegionSelectValue) => void;
}

const RegionSelect: React.FC<RegionSelectProps> = ({
    value,
    onChang
}) => {
    const { getAll } = useRegions();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="region-select-listbox"
                    className="flex w-full items-center justify-between rounded-md border-2 border-neutral-300 p-3 text-lg font-light outline-none transition hover:border-neutral-400"
                >
                    {value ? (
                        <span className="flex flex-row items-center gap-1 truncate">
                            {value.label}
                            <span className="text-neutral-500">{value.region}</span>
                        </span>
                    ) : (
                        <span className="text-neutral-500">任何地方</span>
                    )}
                    <span className="flex flex-row items-center gap-1 shrink-0">
                        {value && (
                            <X
                                size={16}
                                className="text-neutral-400 hover:text-neutral-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChang(null as unknown as RegionSelectValue);
                                }}
                            />
                        )}
                        <ChevronsUpDown size={16} className="text-neutral-400" />
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="搜尋縣市..." />
                    <CommandList id="region-select-listbox">
                        <CommandEmpty>找不到符合的地區</CommandEmpty>
                        <CommandGroup>
                            {getAll().map((region) => (
                                <CommandItem
                                    key={region.value}
                                    value={`${region.label} ${region.region}`}
                                    onSelect={() => {
                                        onChang(region);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "size-4",
                                            value?.value === region.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {region.label}
                                    <span className="text-neutral-500">{region.region}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default RegionSelect;
