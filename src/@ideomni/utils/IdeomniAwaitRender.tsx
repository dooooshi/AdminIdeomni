import { useEffect, useState } from 'react';

type IdeomniAwaitRenderProps = {
	delay?: number;
	children: React.ReactNode;
};

function IdeomniAwaitRender(props: IdeomniAwaitRenderProps) {
	const { delay = 0, children } = props;
	const [awaitRender, setAwaitRender] = useState(true);

	useEffect(() => {
		setTimeout(() => {
			setAwaitRender(false);
		}, delay);
	}, [delay]);

	return awaitRender ? null : children;
}

export default IdeomniAwaitRender;
