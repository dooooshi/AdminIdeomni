import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import { ReactNode, Suspense } from 'react';
import { IdeomniLoadingProps } from '@ideomni/core/IdeomniLoading/IdeomniLoading';

type IdeomniSuspenseProps = {
	loadingProps?: IdeomniLoadingProps;
	children: ReactNode;
};

/**
 * The IdeomniSuspense component is a wrapper around the React Suspense component.
 * It is used to display a loading spinner while the wrapped components are being loaded.
 * The component is memoized to prevent unnecessary re-renders.
 * React Suspense defaults
 * For to Avoid Repetition
 */
function IdeomniSuspense(props: IdeomniSuspenseProps) {
	const { children, loadingProps } = props;
	return <Suspense fallback={<IdeomniLoading {...loadingProps} />}>{children}</Suspense>;
}

export default IdeomniSuspense;
