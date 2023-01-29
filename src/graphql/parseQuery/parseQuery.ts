import type { DocumentNode, OperationDefinitionNode, OperationTypeNode } from 'graphql';
import { parse } from 'graphql';

interface ParseDocumentNodeResult {
  operationType: OperationTypeNode;
  operationName: string;
}

const parseDocumentNode = (node: DocumentNode): ParseDocumentNodeResult => {
  const operationDef = node.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  ) as OperationDefinitionNode;

  return {
    operationType: operationDef?.operation,
    operationName: operationDef?.name?.value ?? ''
  };
};

export const parseQuery = (query: string) => {
  const document = parse(query);
  return parseDocumentNode(document);
};
