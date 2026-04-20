import { useEffect, useState } from "react";

export default function useDashboardAccess(contract, account, maxLandId = 20) {
  const [allowedRoles, setAllowedRoles] = useState(new Set());
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const detectRoles = async () => {
      if (!contract || !account) {
        setAllowedRoles(new Set());
        return;
      }

      try {
        setLoadingRoles(true);
        const wallet = account.toLowerCase();
        const roles = new Set();

        // ✅ 1. Load authority roles in parallel
        const [
          owner,
          surveyor,
          bir,
          cityTreasury,
          assessor,
          rd
        ] = await Promise.all([
          contract.owner().catch(() => null),
          contract.surveyor().catch(() => null),
          contract.bir().catch(() => null),
          contract.cityTreasury().catch(() => null),
          contract.assessor().catch(() => null),
          contract.rd().catch(() => null)
        ]);

        if (owner?.toLowerCase() === wallet) roles.add("admin");
        if (surveyor?.toLowerCase() === wallet) roles.add("surveyor");
        if (bir?.toLowerCase() === wallet) roles.add("bir");
        if (cityTreasury?.toLowerCase() === wallet) roles.add("treasury");
        if (assessor?.toLowerCase() === wallet) roles.add("assessor");
        if (rd?.toLowerCase() === wallet) roles.add("rd");

        // ✅ 2. Load ALL land + sales in parallel
        const requests = [];

        for (let i = 1; i <= maxLandId; i++) {
          requests.push(
            (async () => {
              try {
                const land = await contract.lands(BigInt(i));
                if (!land || !land.exists) return null;

                let sale = null;
                try {
                  sale = await contract.sales(BigInt(i));
                } catch {}

                return { land, sale };
              } catch {
                return null;
              }
            })()
          );
        }

        const results = await Promise.all(requests);

        // ✅ 3. Process results
        for (const result of results) {
          if (!result) continue;

          const { land, sale } = result;

          if (land.owner?.toLowerCase() === wallet) {
            roles.add("seller");
          }

          if (sale?.buyer?.toLowerCase() === wallet) {
            roles.add("buyer");
          }
        }

        setAllowedRoles(roles);
      } catch (error) {
        console.error("Role detection error:", error);
        setAllowedRoles(new Set());
      } finally {
        setLoadingRoles(false);
      }
    };

    detectRoles();
  }, [contract, account, maxLandId]);

  return { allowedRoles, loadingRoles };
} 