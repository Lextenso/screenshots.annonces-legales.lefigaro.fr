import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureRequestSchema } from "@shared/schema";
import { FRENCH_DEPARTMENTS } from "@shared/departments";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addWeeks, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, MapPin, Calendar, Search, RotateCcw, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionFormProps {
  onSubmit: (department: string, startDate: string, articleCount: number) => void;
}

export default function SelectionForm({ onSubmit }: SelectionFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(captureRequestSchema),
    defaultValues: {
      department: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedDepartment = form.watch("department");
  const startDate = form.watch("startDate");

  const dateRange = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = addWeeks(start, 7);
    return {
      start: format(start, "dd/MM/yyyy", { locale: fr }),
      end: format(end, "dd/MM/yyyy", { locale: fr }),
    };
  }, [startDate]);

  const fetchArticlesMutation = useMutation({
    mutationFn: async (data: { department: string; startDate: string }) => {
      const res = await apiRequest("POST", "/api/articles/count", data);
      return await res.json();
    },
    onSuccess: (data) => {
      onSubmit(data.department, data.startDate, data.count);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    fetchArticlesMutation.mutate(data);
  });

  const handleReset = () => {
    form.reset({
      department: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const selectedDept = FRENCH_DEPARTMENTS.find((d) => d.code === selectedDepartment);

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-6 fade-in">
      <div className="flex items-start space-x-3 mb-6">
        <Info className="text-primary text-xl mt-1" />
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">
            Paramètres de capture
          </h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un département et une date de début pour générer les captures d'écran des articles sur une période de 7 semaines.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selection */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="text-primary w-4 h-4" />
                  Département français *
                </FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between px-4 py-3 border border-input bg-accent text-foreground h-auto",
                          !field.value && "text-muted-foreground"
                        )}
                        data-testid="button-department-select"
                      >
                        {field.value
                          ? `${selectedDept?.code} - ${selectedDept?.name}`
                          : "Sélectionnez un département..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher un département..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>Aucun département trouvé.</CommandEmpty>
                        <CommandGroup>
                          {FRENCH_DEPARTMENTS.map((dept) => (
                            <CommandItem
                              key={dept.code}
                              value={`${dept.code} ${dept.name}`}
                              onSelect={() => {
                                field.onChange(dept.code);
                                setOpen(false);
                              }}
                              data-testid={`option-department-${dept.code}`}
                            >
                              {dept.code} - {dept.name}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === dept.code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Vous pouvez rechercher par numéro ou nom de département
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="text-primary w-4 h-4" />
                  Date de début (période de 7 semaines) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="px-4 py-3 border border-input bg-accent text-foreground"
                    data-testid="input-start-date"
                  />
                </FormControl>
                <FormDescription className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {dateRange ? (
                    <span>
                      Les articles seront capturés du{" "}
                      <strong>{dateRange.start}</strong> au{" "}
                      <strong>{dateRange.end}</strong>
                    </span>
                  ) : (
                    <span>Sélectionnez une date de début</span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              className="px-6 py-3 bg-muted text-foreground hover:bg-secondary"
              data-testid="button-reset"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={fetchArticlesMutation.isPending}
              className="px-8 py-3 bg-primary text-primary-foreground hover:opacity-90 shadow-md"
              data-testid="button-submit"
            >
              <Search className="mr-2 w-4 h-4" />
              {fetchArticlesMutation.isPending
                ? "Recherche en cours..."
                : "Rechercher les articles"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
