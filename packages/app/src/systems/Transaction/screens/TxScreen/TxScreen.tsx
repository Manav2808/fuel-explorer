'use client';

import type {
  GroupedInput,
  GroupedOutput,
  Maybe,
} from '@fuel-explorer/graphql';
import {
  Badge,
  Box,
  EntityItem,
  Flex,
  Grid,
  Heading,
  Icon,
  VStack,
  Text,
} from '@fuels/ui';
import { IconArrowDown } from '@tabler/icons-react';
import { bn } from 'fuels';
import { EmptyCard } from '~/systems/Core/components/EmptyCard/EmptyCard';

import { TxBreadcrumb } from '../../component/TxBreadcrumb/TxBreadcrumb';
import { TX_INTENT_MAP, TxIcon } from '../../component/TxIcon/TxIcon';
import { TxInfo } from '../../component/TxInfo/TxInfo';
import { TxInput } from '../../component/TxInput/TxInput';
import { TxOutput } from '../../component/TxOutput/TxOutput';
import { TxScripts } from '../../component/TxScripts/TxScripts';
import type { TransactionNode, TxStatus } from '../../types';

type TxScreenProps = {
  transaction?: Maybe<TransactionNode>;
};

export function TxScreen({ transaction: tx }: TxScreenProps) {
  if (!tx) return null;
  const hasInputs = tx.groupedInputs?.length ?? 0 > 0;
  const hasOutputs = tx.groupedOutputs?.length ?? 0 > 0;
  const title = tx.title as string;

  return (
    <VStack gap="9" className="min-h-[75vh]">
      <TxBreadcrumb transactionId={tx.id} />
      <Grid columns="6" gap="9">
        <Box className="col-span-2">
          <VStack>
            <TxInfo>
              <EntityItem>
                <EntityItem.Slot>
                  <TxIcon
                    status={tx.statusType as TxStatus}
                    type={title}
                    size="lg"
                  />
                </EntityItem.Slot>
                <EntityItem.Info title={title}>
                  <Text as="span" className="text-muted">
                    <Badge
                      color={TX_INTENT_MAP[tx.statusType as string]}
                      variant="ghost"
                    >
                      {tx.statusType}
                    </Badge>
                  </Text>
                </EntityItem.Info>
              </EntityItem>
            </TxInfo>
            <TxInfo name={'Timestamp'} description={tx.time?.full}>
              {tx.time?.fromNow}
            </TxInfo>
            {tx.blockHeight && (
              <TxInfo name={'Block'}>#{tx.blockHeight}</TxInfo>
            )}
            <TxInfo
              name={'Gas spent'}
              description={`Gas limit: ${bn(tx.gasLimit).format()}`}
            >
              {bn(tx.gasUsed).format()}
            </TxInfo>
          </VStack>
        </Box>
        <Box className="col-span-4">
          <VStack>
            <VStack>
              <Heading as="h2" size="5" className="leading-none">
                Inputs
              </Heading>
              {hasInputs ? (
                tx.groupedInputs?.map((input) => (
                  <TxInput
                    key={getInputId(input as GroupedInput)}
                    input={input as GroupedInput}
                  />
                ))
              ) : (
                <EmptyCard hideImage>
                  <EmptyCard.Title>No Inputs</EmptyCard.Title>
                  <EmptyCard.Description>
                    This transaction does not have any inputs.
                  </EmptyCard.Description>
                </EmptyCard>
              )}
            </VStack>
            <Flex justify="center">
              <Icon icon={IconArrowDown} size={30} color="text-muted" />
            </Flex>
            <TxScripts tx={tx} />
            <Flex justify="center">
              <Icon icon={IconArrowDown} size={30} color="text-muted" />
            </Flex>
            <VStack>
              <Heading as="h2" size="5" className="leading-none">
                Outputs
              </Heading>
              {hasOutputs ? (
                tx.groupedOutputs?.map((output) => (
                  <TxOutput
                    key={getOutputId(output as GroupedOutput)}
                    output={output as GroupedOutput}
                  />
                ))
              ) : (
                <EmptyCard hideImage>
                  <EmptyCard.Title>No Outputs</EmptyCard.Title>
                  <EmptyCard.Description>
                    This transaction does not have any outputs.
                  </EmptyCard.Description>
                </EmptyCard>
              )}
            </VStack>
          </VStack>
        </Box>
      </Grid>
    </VStack>
  );
}

function getInputId(input?: Maybe<GroupedInput>) {
  if (!input) return 0;
  if (input.type === 'InputCoin') return input.assetId;
  if (input.type === 'InputContract') return input.contractId;
  return input.sender;
}

function getOutputId(output?: Maybe<GroupedOutput>) {
  if (!output) return 0;
  if (output.type === 'ContractOutput') return output.inputIndex;
  if (output.type === 'ContractCreated') return output.contract?.id ?? 0;
  if (output.type === 'MessageOutput') return output.recipient;
  return output.assetId;
}