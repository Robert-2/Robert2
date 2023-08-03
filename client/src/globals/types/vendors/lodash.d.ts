import 'lodash';

module 'lodash' {
    export type DebouncedMethod<C, M> = DebouncedFunc<InstanceType<C>[M]>;
}
