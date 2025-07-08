'use client';

import IdeomniPageCarded from '@ideomni/core/IdeomniPageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { SyntheticEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from '@ideomni/core/Link';
import useThemeMediaQuery from '@ideomni/hooks/useThemeMediaQuery';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import IdeomniTabs from 'src/components/tabs/IdeomniTabs';
import IdeomniTab from 'src/components/tabs/IdeomniTab';
import InvoiceTab from './tabs/invoice/InvoiceTab';
import DetailsTab from './tabs/details/DetailsTab';
import ProductsTab from './tabs/products/ProductsTab';
import { useGetECommerceOrderQuery } from '../../ECommerceApi';

/**
 * The order.
 */
function Order() {
	const routeParams = useParams<{ orderId: string }>();
	const { orderId } = routeParams;

	const {
		data: order,
		isLoading,
		isError
	} = useGetECommerceOrderQuery(orderId, {
		skip: !orderId
	});

	const isMobile = useThemeMediaQuery((_theme) => _theme.breakpoints.down('lg'));

	const [tabValue, setTabValue] = useState('details');

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading) {
		return <IdeomniLoading />;
	}

	if (isError) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There is no such order!
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/apps/e-commerce/orders"
					color="inherit"
				>
					Go to Orders Page
				</Button>
			</motion.div>
		);
	}

	return (
		<IdeomniPageCarded
			header={
				order && (
					<div className="flex flex-1 flex-col py-8">
						<motion.div
							initial={{ x: 20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
						>
							<PageBreadcrumb className="mb-2" />
						</motion.div>

						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
							className="flex flex-col min-w-0"
						>
							<Typography className="text-2xl truncate font-semibold">
								{`Order ${order.reference}`}
							</Typography>
							<Typography
								variant="caption"
								className="font-medium"
							>
								{`From ${order.customer.firstName} ${order.customer.lastName}`}
							</Typography>
						</motion.div>
					</div>
				)
			}
			content={
				<div className="p-4 sm:p-6 w-full">
					<IdeomniTabs
						className="mb-8"
						value={tabValue}
						onChange={handleTabChange}
					>
						<IdeomniTab
							value="details"
							label="Order Details"
						/>
						<IdeomniTab
							value="products"
							label="Products"
						/>
						<IdeomniTab
							value="invoice"
							label="Invoice"
						/>
					</IdeomniTabs>
					{order && (
						<>
							{tabValue === 'details' && <DetailsTab />}
							{tabValue === 'products' && <ProductsTab />}
							{tabValue === 'invoice' && <InvoiceTab order={order} />}
						</>
					)}
				</div>
			}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default Order;
