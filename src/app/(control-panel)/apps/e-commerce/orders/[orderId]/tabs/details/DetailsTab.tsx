import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useParams } from 'next/navigation';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { useGetECommerceOrderQuery } from '../../../../ECommerceApi';
import OrdersStatus from '../../../OrdersStatus';
import GoogleAddressMap from './GoogleAddressMap';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { motion } from 'motion/react';
import Link from '@ideomni/core/Link';
import { OrderType } from '../../models/OrderModel';

type DetailsTabPropsType = {
	order: OrderType;
};

/**
 * The order's details tab.
 */
function DetailsTab(props: DetailsTabPropsType) {
	const { order } = props;

	const routeParams = useParams();

	const { orderId } = routeParams as { orderId: string };

	const { data: orderData, isError } = useGetECommerceOrderQuery(orderId, {
		skip: !orderId
	});

	const [map, setMap] = useState<string>('shipping');

	if (!isError && !orderData) {
		return null;
	}

	return (
		<motion.div
			className="w-full h-full"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
		>
			<div className="md:flex max-w-2xl">
				<div className="flex flex-col flex-1 md:ltr:pr-8 md:rtl:pl-8">
					<Card
						component={motion.div}
						className="w-full mb-8 rounded-xl shadow-sm border-0"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					>
						<CardContent>
							<div className="mb-6">
								<Typography className="font-semibold mb-1 text-2xl">General Information</Typography>
								<Typography color="text.secondary">Order related details</Typography>
							</div>
							<div className="mb-5">
								<Typography className="mb-1 font-medium text-base">Order ID</Typography>
								<Typography>{order.id}</Typography>
							</div>
							<div className="mb-5">
								<Typography className="mb-1 font-medium text-base">Order Reference</Typography>
								<Typography>{order.reference}</Typography>
							</div>
							<div className="mb-5">
								<Typography className="mb-1 font-medium text-base">Customer</Typography>
								<div className="flex items-center">
									<Typography>{`${order.customer.firstName} ${order.customer.lastName}`}</Typography>
								</div>
							</div>
							<div className="space-y-4">
								<div className="table-responsive border rounded-md">
									<table className="table dense simple">
										<thead>
											<tr>
												<th>
													<Typography className="font-semibold">Name</Typography>
												</th>
												<th>
													<Typography className="font-semibold">Email</Typography>
												</th>
												<th>
													<Typography className="font-semibold">Phone</Typography>
												</th>
												<th>
													<Typography className="font-semibold">Company</Typography>
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<div className="flex items-center">
														<Typography className="truncate">
															{`${order.customer.firstName} ${order.customer.lastName}`}
														</Typography>
													</div>
												</td>
												<td>
													<Typography className="truncate">{order.customer.email}</Typography>
												</td>
												<td>
													<Typography className="truncate">{order.customer.phone}</Typography>
												</td>
												<td>
													<span className="truncate">{order.customer.company}</span>
												</td>
											</tr>
										</tbody>
									</table>
								</div>

								<div className="space-y-4">
									<Accordion
										className="border-0 shadow-0 overflow-hidden"
										expanded={map === 'shipping'}
										onChange={() => setMap(map !== 'shipping' ? 'shipping' : '')}
										sx={{ backgroundColor: 'background.default', borderRadius: '8px!important' }}
									>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography className="font-semibold">Shipping Address</Typography>
										</AccordionSummary>
										<AccordionDetails className="flex flex-col md:flex-row">
											<Typography className="w-full md:max-w-64 mb-4 md:mb-0 mx-2 text-lg">
												{order.customer.shippingAddress.address}
											</Typography>
											<div className="w-full h-80 rounded-xl overflow-hidden mx-2">
												<GoogleAddressMap
													center={{
														lng: order.customer.shippingAddress.lng,
														lat: order.customer.shippingAddress.lat
													}}
												/>
											</div>
										</AccordionDetails>
									</Accordion>

									<Accordion
										className="border-0 shadow-0 overflow-hidden"
										expanded={map === 'invoice'}
										onChange={() => setMap(map !== 'invoice' ? 'invoice' : '')}
										sx={{ backgroundColor: 'background.default', borderRadius: '8px!important' }}
									>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography className="font-semibold">Invoice Address</Typography>
										</AccordionSummary>
										<AccordionDetails className="flex flex-col md:flex-row -mx-2">
											<Typography className="w-full md:max-w-64 mb-4 md:mb-0 mx-2 text-lg">
												{order.customer.invoiceAddress.address}
											</Typography>
											<div className="w-full h-80 rounded-xl overflow-hidden mx-2">
												<GoogleAddressMap
													center={{
														lng: order.customer.invoiceAddress.lng,
														lat: order.customer.invoiceAddress.lat
													}}
												/>
											</div>
										</AccordionDetails>
									</Accordion>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card
						component={motion.div}
						className="w-full mb-8 rounded-xl shadow-sm border-0"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					>
						<CardContent>
							<div className="mb-6">
								<Typography className="font-semibold mb-1 text-2xl">Order Status</Typography>
								<Typography color="text.secondary">Order status related details</Typography>
							</div>
							<div className="table-responsive border rounded-md">
								<Table className="simple">
									<TableHead>
										<TableRow>
											<TableCell>
												<Typography className="font-semibold">Status</Typography>
											</TableCell>
											<TableCell>
												<Typography className="font-semibold">Updated On</Typography>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{order.status.map((status) => (
											<TableRow key={status.id}>
												<TableCell>
													<OrdersStatus name={status.name} />
												</TableCell>
												<TableCell>{status.date}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					<Card
						component={motion.div}
						className="w-full mb-8 rounded-xl shadow-sm border-0"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					>
						<CardContent>
							<div className="mb-6">
								<Typography className="font-semibold mb-1 text-2xl">Payment</Typography>
								<Typography color="text.secondary">Payment related details</Typography>
							</div>
							<div className="table-responsive border rounded-md">
								<table className="simple">
									<thead>
										<tr>
											<th>
												<Typography className="font-semibold">TransactionID</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Payment Method</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Amount</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Date</Typography>
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>
												<span className="truncate">{order.payment.transactionId}</span>
											</td>
											<td>
												<span className="truncate">{order.payment.method}</span>
											</td>
											<td>
												<span className="truncate">{order.payment.amount}</span>
											</td>
											<td>
												<span className="truncate">{order.payment.date}</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					<Card
						component={motion.div}
						className="w-full mb-8 rounded-xl shadow-sm border-0"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					>
						<CardContent>
							<div className="mb-6">
								<Typography className="font-semibold mb-1 text-2xl">Shipping</Typography>
								<Typography color="text.secondary">Shipping related details</Typography>
							</div>
							<div className="table-responsive border rounded-md">
								<table className="simple dense">
									<thead>
										<tr>
											<th>
												<Typography className="font-semibold">Tracking Code</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Carrier</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Weight</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Fee</Typography>
											</th>
											<th>
												<Typography className="font-semibold">Date</Typography>
											</th>
										</tr>
									</thead>
									<tbody>
										{order.shippingDetails.map((shipping) => (
											<tr key={shipping.date}>
												<td>
													<span className="truncate">{shipping.tracking}</span>
												</td>
												<td>
													<span className="truncate">{shipping.carrier}</span>
												</td>
												<td>
													<span className="truncate">{shipping.weight}</span>
												</td>
												<td>
													<span className="truncate">{shipping.fee}</span>
												</td>
												<td>
													<span className="truncate">{shipping.date}</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</motion.div>
	);
}

export default DetailsTab;
