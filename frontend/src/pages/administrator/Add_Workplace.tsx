
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Plus, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';

const AddWorkplace: React.FC = () => {
	const { toast } = useToast();
	const { t } = useTranslation();
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	type Workplace = {
		id: string;
		name: string;
		address: string;
		createdAt?: string;
	};
	const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchWorkplaces();
	}, []);

	const fetchWorkplaces = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/workplaces');
			setWorkplaces(res.data);
		} catch {
			toast({
				title: t('error'),
				description: t('failed_to_fetch_workplaces'),
				variant: 'destructive',
			});
		}
		setLoading(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !address) {
			toast({
				title: t('missing_info'),
				description: t('name_address_required'),
				variant: 'destructive',
			});
			return;
		}
		try {
			await api.post('/admin/workplaces', { name, address });
			toast({
				title: t('workplace_added'),
				description: t('workplace_added_success', { name }),
			});
			setName('');
			setAddress('');
			fetchWorkplaces();
		} catch {
			toast({
				title: t('error'),
				description: t('failed_to_add_workplace'),
				variant: 'destructive',
			});
		}
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
				<div className="space-y-8  mx-auto py-8">
					<div>
						<h1 className="text-3xl font-extrabold" style={{ color: '#39092c' }}>{t('add_workplace')}</h1>
						<p className="text-muted-foreground">{t('create_manage_workplaces')}</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Add Workplace Form */}
						<Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
							<CardHeader>
								<CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
									<Plus className="w-5 h-5" />
									{t('new_workplace')}
								</CardTitle>
								<CardDescription>{t('fill_details_add_workplace')}</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="name">{t('name')} *</Label>
										<Input
											id="name"
											placeholder={t('main_office_placeholder')}
											value={name}
											onChange={e => setName(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="address">{t('address')} *</Label>
										<Input
											id="address"
											placeholder={t('address_placeholder')}
											value={address}
											onChange={e => setAddress(e.target.value)}
										/>
									</div>
									<Button type="submit" className="w-full bg-[#39092c] hover:bg-[#4e1850] text-white">
										<Plus className="w-4 h-4 mr-2" />
										{t('add_workplace')}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Existing Workplaces List */}
						<Card className="border-0 rounded-2xl bg-gradient-to-tr from-white to-[#f3e8ff] shadow-md">
							<CardHeader>
								<CardTitle className="flex items-center gap-2" style={{ color: '#39092c' }}>
									<MapPin className="w-5 h-5" />
									{t('existing_workplaces')}
								</CardTitle>
								<CardDescription>{t('workplaces_available_for_assignment')}</CardDescription>
							</CardHeader>
							<CardContent>
								{loading ? (
									<div>{t('loading')}</div>
								) : (
									<div className="space-y-3">
										{workplaces.length === 0 ? (
											<div className="text-center py-4 text-muted-foreground">{t('no_workplaces_found')}</div>
										) : (
											workplaces.map((wp) => (
												<div key={wp.id} className="p-3 rounded-lg bg-muted/30 flex flex-col md:flex-row md:items-center md:justify-between">
													<div>
														<p className="font-medium text-sm">{wp.name}</p>
														<p className="text-xs text-muted-foreground flex items-center">
															<MapPin className="w-3 h-3 mr-1" />
															{wp.address}
														</p>
													</div>
													<p className="text-xs text-muted-foreground mt-2 md:mt-0">
														{t('added')}: {wp.createdAt ? format(new Date(wp.createdAt), 'yyyy-MM-dd') : t('n_a')}
													</p>
												</div>
											))
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddWorkplace;
