/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { forOwn, indexOf } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import Popover from 'components/popover';
import { requestActivityActionTypeCounts } from 'state/data-getters';

export class ActionTypeSelector extends Component {
	constructor( props ) {
		super( props );
		this.activityTypeButton = React.createRef();
	}

	isAllCheckboxSelected = checkboxes => {
		if ( ! this.props.selected ) {
			return true;
		}
		if ( checkboxes.length === this.props.selected.length ) {
			return true;
		}

		return false;
	};

	renderCheckbox = ( allCheckboxes, checkbox ) => {
		const { onSelectClick, selected } = this.props;
		return (
			<FormLabel key={ checkbox.key }>
				<FormCheckbox
					id={ checkbox.key }
					checked={ !! this.isSelected( selected, checkbox.key ) || ! selected }
					name={ checkbox.key }
					onChange={ onSelectClick.bind( this, checkbox, allCheckboxes ) }
				/>
				{ checkbox.name + ' (' + checkbox.count + ')' }
			</FormLabel>
		);
	};

	renderPlaceholder = i => {
		return (
			<div className="filterbar__activity-types-selection-placeholder" key={ 'placeholder' + i } />
		);
	};

	isSelected = ( selection, key ) =>
		selection && !! selection.length && indexOf( selection, key ) >= 0;

	render() {
		const {
			translate,
			actionTypes,
			isVisible,
			onClose,
			onButtonClick,
			selected,
			onResetSelection,
			onToggleAllCheckboxes,
		} = this.props;
		const checkboxes = [];
		const selectedNames = [];
		let totalCount = 0;

		if ( actionTypes && actionTypes.groups ) {
			forOwn( actionTypes.groups, ( group, slug ) => {
				checkboxes.push( {
					key: slug,
					name: group.name,
					count: group.count,
				} );
				totalCount += group.count;
				if ( this.isSelected( selected, slug ) ) {
					selectedNames.push( group.name );
				}
			} );
		}

		if ( selected && selected[ 0 ] === 'no-group' ) {
			selectedNames.push( translate( 'Activity Type: None Selected' ) );
		}
		const buttonClass = classnames( {
			filterbar__selection: true,
			'is-selected': !! selectedNames.length,
		} );

		return (
			<Fragment>
				<Button
					className={ buttonClass }
					compact
					borderless
					onClick={ onButtonClick }
					ref={ this.activityTypeButton }
				>
					{ ! selectedNames.length && translate( 'Activity Type' ) }
					{ !! selectedNames.length && selectedNames.join( ', ' ) }
				</Button>
				{ !! selectedNames.length && (
					<Button
						className="filterbar__selection-close"
						compact
						borderless
						onClick={ onResetSelection }
					>
						<Gridicon icon="cross-small" />
					</Button>
				) }
				<Popover
					id="filterbar__activity-types"
					isVisible={ isVisible }
					onClose={ onClose }
					autoPosition={ true }
					context={ this.activityTypeButton.current }
				>
					<div className="filterbar__activity-types-selection-wrap">
						{ actionTypes &&
							!! checkboxes.length && (
								<Fragment>
									<FormLabel>
										<FormCheckbox
											id="comment_like_notification"
											onChange={ onToggleAllCheckboxes.bind( this, checkboxes ) }
											checked={ this.isAllCheckboxSelected( checkboxes ) }
											name="comment_like_notification"
										/>
										<strong>
											{ translate( 'All activity type (%(totalCount)d)', {
												args: { totalCount },
											} ) }
										</strong>
									</FormLabel>
									<div className="filterbar__activity-types-selection-granular">
										{ checkboxes.map( this.renderCheckbox.bind( null, checkboxes ) ) }
									</div>
								</Fragment>
							) }
						{ ! actionTypes && [ 1, 2, 3 ].map( this.renderPlaceholder ) }
						{ actionTypes &&
							! checkboxes.length && (
								<p>{ translate( 'No activities recorded in the selected date range.' ) }</p>
							) }
					</div>
				</Popover>
			</Fragment>
		);
	}
}
const mapStateToProps = ( state, { siteId, filter } ) => {
	const actionTypesRequest = requestActivityActionTypeCounts( siteId, filter );
	return {
		actionTypes: actionTypesRequest.data,
	};
};
export default connect( mapStateToProps )( localize( ActionTypeSelector ) );
