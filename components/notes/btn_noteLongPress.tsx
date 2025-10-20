import React, { ReactElement } from "react";
import { TouchableOpacity } from "react-native";
type NoteLongPress_Btn_Props = {
    icon : any,
    onPress : () => void
}

export default function NoteLongPress_Btn({icon, onPress } : NoteLongPress_Btn_Props){
    return(
        <TouchableOpacity 
            style = {{
                backgroundColor : '#1e293b',
                width : 28,
                height : 28, 
                borderRadius : 50, 
                alignItems : 'center', 
                justifyContent : 'center'
            }}
            onPress={onPress}
        >
            {icon}
        </TouchableOpacity>
    )
}