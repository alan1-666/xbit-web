import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useEffect, useState } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { useSelector } from 'react-redux'
import { useSubscription } from '@/lib/mqtt'
import { useAppSelector } from '@/redux/store'

export default function TurnkeyPolicySubcription() {
  const { indexedDbClient } = useTurnkey()
  const [policy, setPolicy] = useState<any>()
  const [policyUpdated, setPolicyUpdated] = useState<any>()
  const activeWallet = useSelector(_activeWallet)
  const [systemUserId, setSystemUserId] = useState<string|null>(null)
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyRootUserId)
  const subOrgId = useAppSelector((state) => state.newWallet.subOrgId)

  useEffect(() => {
    if (activeWallet?.isConnected && indexedDbClient) {
      indexedDbClient?.getPolicies().then((res) => setPolicy(res?.policies))

      indexedDbClient?.getUsers().then((res) => {
        const systemUser = res?.users?.find((user) => user.userId != turnkeyUserId)
        setSystemUserId(systemUser?.userId || null)
      })
    }
  }, [activeWallet?.isConnected, indexedDbClient])

  const _message = useSubscription('public/turnkey_policy_updated')
  const message = _message?.message?.message

  useEffect(() => {
    if (!message) return
    try {
      const data = JSON.parse(message.toString() || '')
      setPolicyUpdated(data)
    } catch (error) {
      console.warn('TurnkeyPolicySubcription error: ', error)
    }
  }, [message])

  useEffect(() => {
    if (policy && policyUpdated && systemUserId) {
      policyUpdated.forEach((backendPolicy: any) => {
        const existedPolicy = policy.find((item: any) => item?.policyName === backendPolicy?.name)

        if (!existedPolicy) {
          const policy = formatTurnkeyPolicy(backendPolicy)

          indexedDbClient?.createPolicy({
            organizationId: subOrgId,
            ...policy,
          })

          return
        }

        const formattedCondition = formatPolicyString(backendPolicy?.condition, [
          { key: '$SYSTEM_USER_ID', value: systemUserId ?? '' },
        ])
        const formattedConsensus = formatPolicyString(backendPolicy?.consensus, [
          { key: '$SYSTEM_USER_ID', value: systemUserId ?? '' }
        ])

        const needToUpdate = existedPolicy.condition !== formattedCondition || existedPolicy.consensus !== formattedConsensus|| existedPolicy.effect !== backendPolicy.effect

        if (needToUpdate) {
          const newPolicy = formatTurnkeyPolicy(backendPolicy)

          indexedDbClient?.updatePolicy({
            policyId: existedPolicy.policyId,
            policyName: newPolicy.policyName,
            policyEffect: newPolicy.effect,
            policyCondition: newPolicy.condition,
            policyConsensus: newPolicy.consensus,
            policyNotes: newPolicy.notes,
          })
        }
      })
    }
  }, [policy, policyUpdated])

  const formatTurnkeyPolicy = (backendPolicy: any) => {
    return {
      policyName: backendPolicy.name,
      effect: backendPolicy.effect as 'EFFECT_ALLOW' | 'EFFECT_DENY',
      notes: backendPolicy.notes,
      consensus: formatPolicyString(backendPolicy.consensus, [
          { key: '$SYSTEM_USER_ID', value: systemUserId ?? '' },
      ]),
      condition: formatPolicyString(backendPolicy.condition, [
        { key: '$SYSTEM_USER_ID', value: systemUserId ?? '' },
    ]),
    }
  }


  const formatPolicyString = (originString: string, replacers: { key: string; value: string }[]): string => {
    let formattedString = originString;

    replacers.forEach(({ key, value }) => {
        formattedString = (formattedString as any)?.replaceAll(key, value);
    });

    return formattedString;
  };

  return <></>
}
