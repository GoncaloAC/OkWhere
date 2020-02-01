import axios from 'axios'
import GeneralServices from './../../services/generalService.json'

export interface OkWhereEvent {
    id?: number | null,
    title: string,
    description?: string | null,
    type: number,
    email?: string | null,
    phone?: number | undefined,
    creator?: string | null,
    create_time?: string | null,
    date_start: string,
    date_end: string,
    img_path?: string | null,
    location: string,
    join_mode?: string | null,
    unseen: boolean,
    participants?: Participant[] | null
}

export interface LightEvent {
    id?: number | null,
    title: string,
    description?: string | null,
    img_path?: string | null,
    creator?: string | null
}

export interface Cluster {
    id: number,
    label: string,
    type: number,
    items?: ClusterItem[]
}

export interface ClusterItem {
    label: string,
    icon_path: string | null,
    description: string | null, 
    amount: number
}

export interface Participant {
    username: string,
    img_path?: string,
    is_admin?: boolean,
    is_staff?: boolean,
    is_blind?: boolean
}

export interface GenericPages {
    cursor: string,
    size: number,
    hasNext: boolean,
    results: LightEvent[]
}

export async function postEvent(event: FormData) {
    try {
        return await axios.post(GeneralServices.serverUrl + GeneralServices.createEvent, event, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}

export async function putEvent(id: number, event: FormData){
    try {
        return await axios.put(GeneralServices.serverUrl + GeneralServices.createEvent + "/" + id, event, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}


export async function getEvent(id: number) {
    try {
        return await axios.get(GeneralServices.serverUrl + GeneralServices.getEvent + "/" + id, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}

export async function getEvents(cursor: string | undefined, by: string | undefined, order: string | undefined, value?: number) {
    let query: string = ""
    if (cursor !== undefined)
        query = "?cursor=" + cursor
    if (by !== undefined)
        if (query.length === 0) {
            query = "?by=" + by
            if(by === "type") {
                query += "&value="+value;
            }
        } else {
            query += "&by=" + by
            if(by === "type") {
                query += "=" + value;
            }
        }
    if (order !== undefined)
        if (query.length === 0)
            query = "?order=" + order
        else
            query += "&order=" + order
    try {
        return await axios.get(GeneralServices.serverUrl + GeneralServices.getEvent + query, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}

export async function getUsers(cursor: string | undefined) {
    let query: string = ""
    if (cursor !== undefined)
        query = "?cursor=" + cursor
    try {
        return await axios.get(GeneralServices.serverUrl + GeneralServices.getUsers + query, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}

export async function getItems(eventId: number) {
    try {
        return await axios.get(GeneralServices.serverUrl + GeneralServices.getEvent + "/" + eventId + "/rows", GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}

export async function getParticipants(eventId: number) {
    try {
        return await axios.get(GeneralServices.serverUrl + GeneralServices.getEvent + "/" + eventId + GeneralServices.participants, GeneralServices.cookieParams)
    } catch (err) {
        throw err.response
    }
}