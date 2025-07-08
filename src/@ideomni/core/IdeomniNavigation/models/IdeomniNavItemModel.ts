import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { IdeomniNavItemType } from '../types/IdeomniNavItemType';

/**
 *  IdeomniNavItemModel
 *  Constructs a navigation item based on IdeomniNavItemType
 */
function IdeomniNavItemModel(data?: PartialDeep<IdeomniNavItemType>) {
	data = data || {};

	return _.defaults(data, {
		id: _.uniqueId(),
		title: '',
		translate: '',
		auth: null,
		subtitle: '',
		icon: '',
		iconClass: '',
		url: '',
		target: '',
		type: 'item',
		sx: {},
		disabled: false,
		active: false,
		exact: false,
		end: false,
		badge: null,
		children: []
	});
}

export default IdeomniNavItemModel;
