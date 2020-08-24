import { useEffect, useState } from 'react';

import { getMyId } from '@/api/spotify';

/**
 * Fetch user ID asynchronously.
 *
 * @return User ID
 */
export function useUserId(): string {
	const [userId, setUserId] = useState<string>(null);

	useEffect(() => {
		async function fetchUserId() {
			setUserId(await getMyId());
		}

		fetchUserId();
	}, []);

	return userId;
}
