import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { CalendarIcon, Calculator, Clock, Euro, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';

const calculatorSchema = z.object({
  cleanerId: z.string().min(1, 'Please select a cleaner'),
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const SalaryCalculator = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
  });

  // Fetch cleaners from backend
  useEffect(() => {
    api.get('/admin/salary-calculator/cleaners').then(res => {
      setCleaners(res.data);
    });
  }, []);

  const onSubmit = async (values: z.infer<typeof calculatorSchema>) => {
    setLoading(true);
    setCalculationResult(null);
    try {
      const params = new URLSearchParams({
        cleanerId: values.cleanerId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      const res = await api.get(`/admin/salary-calculator/calculate?${params.toString()}`);
      setCalculationResult(res.data);
      toast({
        title: t('salary_calculated'),
        description: t('total_pay_toast', { totalPay: res.data.totalPay?.toFixed(2) || 0 }),
      });
    } catch (err: any) {
      toast({
        title: t('calculation_failed'),
        description: err?.response?.data?.message || t('an_error_occurred'),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f7f8fa] to-[#e9e3f5]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen z-30">
        <Sidebar role="ADMIN" />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="sticky top-3 z-20 bg-transparent">
          <Header />
        </div>
        <div className="space-y-8 mx-auto py-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{t('salary_calculator')}</h1>
            <p className="text-muted-foreground">
              {t('salary_calculator_desc')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Calculation Form */}
            <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                  <Calculator className="h-5 w-5" />
                  {t('calculate_salary')}
                </CardTitle>
                <CardDescription>
                  {t('select_cleaner_date_range')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cleanerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('select_cleaner')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('choose_cleaner')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cleaners.map((cleaner) => (
                                <SelectItem key={cleaner.id} value={cleaner.id}>
                                  {cleaner.name} - €{cleaner.hourlyRate}/{t('hour_short')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('start_date')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-[#39092c] text-[#39092c]",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t('pick_start_date')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('end_date')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-[#39092c] text-[#39092c]",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t('pick_end_date')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-[#39092c] hover:bg-[#4e1850] text-white" disabled={loading}>
                      <Calculator className="w-4 h-4 mr-2" />
                      {loading ? t('calculating') : t('calculate_salary')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Calculation Results */}
            {calculationResult && (
              <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                    <FileText className="h-5 w-5" />
                    {t('calculation_results')}
                  </CardTitle>
                  <CardDescription>
                    {t('salary_breakdown_for', { cleanerName: calculationResult.cleanerName })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{t('period')}</span>
                      <span className="text-sm">
                        {format(new Date(form.getValues().startDate), 'PPP')} - {format(new Date(form.getValues().endDate), 'PPP')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {t('regular_hours')}
                        </span>
                        <span>{calculationResult.totalRegularHours}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          {t('overtime_hours')}
                        </span>
                        <span>{calculationResult.totalOvertimeHours}h</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span>{t('total_hours')}</span>
                        <span>{(calculationResult.totalRegularHours + calculationResult.totalOvertimeHours)}h</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          {t('regular_pay')}
                        </span>
                        <span>€{calculationResult.regularPay?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-amber-500" />
                          {t('overtime_pay')}
                        </span>
                        <span>€{calculationResult.overtimePay?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold bg-primary/10 p-3 rounded-lg">
                        <span>{t('total_pay')}</span>
                        <span>€{calculationResult.totalPay?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;