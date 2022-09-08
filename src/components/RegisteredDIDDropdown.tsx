import {FC} from "react";
import {Select} from "@chakra-ui/react";

type Props = { selectedDID: string, dids: string[], setDID: (did: string) => void };
export const RegisteredDIDDropdown: FC<Props> = ({ selectedDID, dids, setDID }) => {
    return <Select value={selectedDID} onChange={(event) => setDID(event.target.value)}>
        {dids.map(n => <option key={n} value={n}>{n}</option>
        )}
    </Select>;
}