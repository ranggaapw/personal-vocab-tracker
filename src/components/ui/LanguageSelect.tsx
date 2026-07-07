import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { id: 'Indonesian', label: '🇮🇩 Indonesian' },
    { id: 'Japanese', label: '🇯🇵 Japanese' },
    { id: 'Korean', label: '🇰🇷 Korean' },
    { id: 'Spanish', label: '🇪🇸 Spanish' },
    { id: 'French', label: '🇫🇷 French' },
    { id: 'German', label: '🇩🇪 German' },
];

export function LanguageSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger className="inline-flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-bold text-brand-primary hover:bg-brand-pale/50 outline-none transition-colors gap-2 data-[state=open]:bg-brand-pale">
                <Select.Value />
                <Select.Icon>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                    <Select.Viewport className="p-2">
                        {LANGUAGES.map((lang) => (
                            <Select.Item
                                key={lang.id}
                                value={lang.id}
                                className="relative flex items-center px-6 py-2 text-sm font-medium text-slate-700 rounded-md cursor-pointer hover:bg-brand-primary hover:text-white outline-none select-none data-[state=checked]:text-brand-primary data-[state=checked]:hover:text-white"
                            >
                                <Select.ItemText>{lang.label}</Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2">
                                    <Check className="h-3 w-3" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}