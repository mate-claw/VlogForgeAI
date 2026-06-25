import React from 'react';
import type { VlogRenderInput } from '@ai-vlog/shared';
import { DirectorRuntime } from '../runtime/DirectorRuntime';
import { sampleInput } from '../sampleInput';
export const DynamicLifeVlog: React.FC<VlogRenderInput> = (props) => <DirectorRuntime {...(props?.plan ? props : sampleInput)} />;
