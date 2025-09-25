import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { DollarSign, Clock, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';

const paymentSchema = z.object({
  regularRate: z.string().min(1, 'Regular hourly rate is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Must be a valid positive number'
  ),
});

const Payment = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      regularRate: '25.00',
    },
  });

  // Fetch current rate on mount
  useEffect(() => {
    api.get('/admin/payment-settings').then(res => {
      form.setValue('regularRate', res.data.regularRate.toFixed(2));
    });
  }, []);

  const regularRate = Number(form.watch('regularRate') || 0);
  const overtimeRate = (regularRate * 1.5).toFixed(2);
  const sundayRate = (regularRate * 2).toFixed(2);

  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    api.post('/admin/payment-settings', { regularRate: Number(values.regularRate) })
      .then(() => {
        toast({
          title: t('rates_updated'),
          description: t('hourly_rate_updated'),
        });
      });
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
          {/* Title & Description */}
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{t('payment_settings_title')}</h1>
            <p className="text-muted-foreground">
              {t('payment_settings_description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Current Rates Overview */}
            <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
                  <DollarSign className="h-5 w-5" />
                  {t('current_rates')}
                </CardTitle>
                <CardDescription>
                  {t('active_payment_rates')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('regular_hours')}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#39092c' }}>€{regularRate}/hr</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{t('overtime_hours')} (1.5x)</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#39092c' }}>€{overtimeRate}/hr</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{t('sunday_hours')} (2x)</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#39092c' }}>€{sundayRate}/hr</span>
                </div>
              </CardContent>
            </Card>

            {/* Rate Configuration */}
            <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
              <CardHeader>
                <CardTitle style={{ color: '#39092c' }}>{t('update_regular_rate')}</CardTitle>
                <CardDescription>
                  {t('modify_hourly_rate')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="regularRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('regular_hourly_rate_label')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="25.00"
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-[#39092c] hover:bg-[#4e1850] text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {t('save_changes')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Payment Policy Information */}
          <Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
            <CardHeader>
              <CardTitle style={{ color: '#39092c' }}>{t('payment_policy')}</CardTitle>
              <CardDescription>
                {t('payment_policy_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#39092c' }}>{t('overtime_rules')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t('overtime_rule_1')}</li>
                    <li>{t('overtime_rule_2')}</li>
                    <li>{t('overtime_rule_3')}</li>
                    <li>{t('overtime_rule_4')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#39092c' }}>{t('payment_schedule')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t('payment_schedule_1')}</li>
                    <li>{t('payment_schedule_2')}</li>
                    <li>{t('payment_schedule_3')}</li>
                    <li>{t('payment_schedule_4')}</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{t('important_note')}</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('important_note_description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;