import type { DocumentNode, OperationDefinitionNode, OperationTypeNode } from 'graphql';
import { parse } from 'graphql';

interface ParseDocumentNodeResult {
  operationType: OperationTypeNode;
  operationName: string;
}

const parseDocumentNode = (node: DocumentNode): ParseDocumentNodeResult => {
  const operationDefinition = node.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  ) as OperationDefinitionNode;

  return {
    operationType: operationDefinition.operation,
    operationName: operationDefinition.name?.value ?? ''
  };
};

export const parseQuery = (query: string) => {
  try {
    const document = parse(query);
    return parseDocumentNode(document);
  } catch {
    return null;
  }
};
